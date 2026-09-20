import { loadConfig, getConfigValue, requireConfigValue } from "../utils/config";
import { runQuery } from "../utils/neptune";

function truncateValue(val: unknown): unknown {
  if (Array.isArray(val)) {
    if (val.length > 5 && typeof val[0] === "number") {
      return `[Float Array (${val.length} dimensions)]`;
    }
    if (val.length > 10) {
      return `[Array (${val.length} items)]`;
    }
    return val.map(truncateValue);
  }
  if (typeof val === "string" && val.length > 80) {
    return val.slice(0, 77) + "...";
  }
  if (val && typeof val === "object") {
    const res: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
      res[k] = truncateValue(v);
    }
    return res;
  }
  return val;
}

function printHeader(title: string) {
  const line = "=".repeat(60);
  console.log(`\n${line}`);
  console.log(`  ${title}`);
  console.log(`${line}\n`);
}

function printSection(title: string) {
  console.log(`\n--- ${title} ---`);
}

async function main() {
  const isJsonOutput = process.argv.includes("--json");
  const customQueryArg = process.argv.find((arg) => arg.startsWith("--query="));

  try {
    await loadConfig();
    const endpoint = getConfigValue("AWS_NEPTUNE_ENDPOINT", "unknown");

    if (!isJsonOutput) {
      printHeader("NEPTUNE GRAPH DATABASE INSPECTOR");
      console.log(`🔗 Endpoint: ${endpoint}`);
      console.log(`⏱️  Connecting to Neptune...`);
    }

    // Support running custom queries via --query="MATCH (n) RETURN n LIMIT 10"
    if (customQueryArg) {
      const query = customQueryArg.replace("--query=", "");
      console.log(`\nExecuting Custom Query:\n${query}\n`);
      const results = await runQuery(query);
      console.log(JSON.stringify(truncateValue(results), null, 2));
      return;
    }

    // 1. Overall Graph Statistics
    const [nodeCountRes, edgeCountRes, labelCountsRes, edgeTypeCountsRes] =
      await Promise.all([
        runQuery<{ totalNodes: number }>(
          "MATCH (n) RETURN count(n) AS totalNodes",
        ).catch(() => [{ totalNodes: 0 }]),
        runQuery<{ totalEdges: number }>(
          "MATCH ()-[r]->() RETURN count(r) AS totalEdges",
        ).catch(() => [{ totalEdges: 0 }]),
        runQuery<{ label: string[]; count: number }>(
          "MATCH (n) RETURN labels(n) AS label, count(n) AS count ORDER BY count DESC",
        ).catch(() => []),
        runQuery<{ type: string; count: number }>(
          "MATCH ()-[r]->() RETURN type(r) AS type, count(r) AS count ORDER BY count DESC",
        ).catch(() => []),
      ]);

    const totalNodes = nodeCountRes[0]?.totalNodes ?? 0;
    const totalEdges = edgeCountRes[0]?.totalEdges ?? 0;

    // 2. Fetch all nodes
    const allNodes = await runQuery<{
      id: string;
      labels: string[];
      properties: Record<string, unknown>;
    }>(
      "MATCH (n) RETURN id(n) AS id, labels(n) AS labels, properties(n) AS properties LIMIT 200",
    );

    // 3. Fetch all edges/relationships
    const allEdges = await runQuery<{
      srcId: string;
      srcLabels: string[];
      srcProps: Record<string, unknown>;
      relType: string;
      relProps: Record<string, unknown>;
      tgtId: string;
      tgtLabels: string[];
      tgtProps: Record<string, unknown>;
    }>(
      `MATCH (src)-[r]->(tgt)
       RETURN id(src) AS srcId, labels(src) AS srcLabels, properties(src) AS srcProps,
              type(r) AS relType, properties(r) AS relProps,
              id(tgt) AS tgtId, labels(tgt) AS tgtLabels, properties(tgt) AS tgtProps
       LIMIT 300`,
    );

    if (isJsonOutput) {
      console.log(
        JSON.stringify(
          {
            summary: {
              totalNodes,
              totalEdges,
              labels: labelCountsRes,
              relationships: edgeTypeCountsRes,
            },
            nodes: allNodes.map((n) => ({
              ...n,
              properties: truncateValue(n.properties),
            })),
            edges: allEdges.map((e) => ({
              ...e,
              srcProps: truncateValue(e.srcProps),
              relProps: truncateValue(e.relProps),
              tgtProps: truncateValue(e.tgtProps),
            })),
          },
          null,
          2,
        ),
      );
      return;
    }

    // Format human-readable output
    printSection("1. GRAPH SUMMARY");
    console.log(`📊 Total Nodes: ${totalNodes}`);
    console.log(`🔗 Total Edges: ${totalEdges}`);

    console.log("\nNodes by Label:");
    if (labelCountsRes.length === 0) {
      console.log("  (None found)");
    } else {
      for (const row of labelCountsRes) {
        const labelName = Array.isArray(row.label)
          ? row.label.join(":")
          : String(row.label);
        console.log(`  • :${labelName} -> ${row.count}`);
      }
    }

    console.log("\nEdges by Type:");
    if (edgeTypeCountsRes.length === 0) {
      console.log("  (None found)");
    } else {
      for (const row of edgeTypeCountsRes) {
        console.log(`  • [:${row.type}] -> ${row.count}`);
      }
    }

    // Section 2: All Nodes
    printSection(`2. ALL NODES (${allNodes.length} retrieved)`);
    if (allNodes.length === 0) {
      console.log("  (Graph contains 0 nodes)");
    } else {
      allNodes.forEach((node, idx) => {
        const labelStr = Array.isArray(node.labels)
          ? node.labels.map((l) => `:${l}`).join("")
          : ":Node";
        const props = truncateValue(node.properties || {});
        console.log(`\n[Node #${idx + 1}] ID: ${node.id} ${labelStr}`);
        console.log(`  Properties:`, JSON.stringify(props, null, 2).replace(/\n/g, "\n  "));
      });
    }

    // Section 3: All Edges
    printSection(`3. ALL EDGES / RELATIONSHIPS (${allEdges.length} retrieved)`);
    if (allEdges.length === 0) {
      console.log("  (Graph contains 0 edges)");
    } else {
      allEdges.forEach((edge, idx) => {
        const srcLabel = Array.isArray(edge.srcLabels)
          ? edge.srcLabels.join(":")
          : "Node";
        const tgtLabel = Array.isArray(edge.tgtLabels)
          ? edge.tgtLabels.join(":")
          : "Node";

        const srcName =
          edge.srcProps?.title ||
          edge.srcProps?.shortname ||
          edge.srcProps?.name ||
          edge.srcProps?.projectId ||
          edge.srcProps?.meetingId ||
          edge.srcId;

        const tgtName =
          edge.tgtProps?.title ||
          edge.tgtProps?.shortname ||
          edge.tgtProps?.name ||
          edge.tgtProps?.text ||
          edge.tgtProps?.actionSlug ||
          edge.tgtProps?.recordId ||
          edge.tgtId;

        console.log(
          `\n[Edge #${idx + 1}] (:${srcLabel} "${srcName}") -[:${edge.relType}]-> (:${tgtLabel} "${tgtName}")`,
        );
        if (edge.relProps && Object.keys(edge.relProps).length > 0) {
          console.log(`  Edge Properties:`, edge.relProps);
        }
      });
    }

    printHeader("INSPECTION COMPLETE");
  } catch (error: any) {
    console.error("\n❌ Error querying Neptune database:", error?.message || error);
    console.error("\nTroubleshooting Tips:");
    console.error(
      "1. If this machine is outside the AWS VPC, Neptune endpoints (*.neptune.amazonaws.com) are not directly reachable over the public internet.",
    );
    console.error(
      "2. To connect locally, set up an SSH tunnel through an EC2 bastion in the same VPC:",
    );
    console.error(
      "   ssh -i <key.pem> -N -L 8182:<neptune-cluster-endpoint>:8182 ec2-user@<bastion-public-ip>",
    );
    console.error(
      "3. Then specify AWS_NEPTUNE_ENDPOINT=localhost:8182 in your environment or command line.",
    );
    process.exit(1);
  }
}

main();
