import { NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"
import fs from "fs"
import path from "path"
import os from "os"

const execPromise = promisify(exec)

export async function POST(request: Request) {
  try {
    // Get data from request
    const data = await request.json()
    const { buildingName, unitsCount, committeeMembers } = data

    // Create a temporary PHP file
    const tempDir = os.tmpdir()
    const phpFilePath = path.join(tempDir, "advanced.php")

    // PHP code to execute with data from request
    const phpCode = `<?php
      // Data received from Next.js
      $buildingName = "${buildingName}";
      $unitsCount = ${unitsCount};
      $committeeMembers = json_decode('${JSON.stringify(committeeMembers)}', true);
      
      // Calculate some statistics
      $totalEntitlements = 0;
      foreach ($committeeMembers as $member) {
        if (isset($member['entitlements'])) {
          $totalEntitlements += $member['entitlements'];
        }
      }
      
      // Generate HTML output
      echo "<div style='font-family: system-ui, sans-serif;'>";
      echo "<h2 style='color: #333;'>$buildingName</h2>";
      echo "<p>Number of units: $unitsCount</p>";
      echo "<p>Total committee entitlements: $totalEntitlements</p>";
      
      echo "<h3>Strata Committee Members</h3>";
      echo "<table style='border-collapse: collapse; width: 100%;'>";
      echo "<tr style='background-color: #f2f2f2;'>";
      echo "<th style='border: 1px solid #ddd; padding: 8px; text-align: left;'>Name</th>";
      echo "<th style='border: 1px solid #ddd; padding: 8px; text-align: left;'>Role</th>";
      echo "<th style='border: 1px solid #ddd; padding: 8px; text-align: left;'>Unit</th>";
      echo "<th style='border: 1px solid #ddd; padding: 8px; text-align: left;'>Entitlements</th>";
      echo "</tr>";
      
      foreach ($committeeMembers as $member) {
        echo "<tr>";
        echo "<td style='border: 1px solid #ddd; padding: 8px;'>{$member['name']}</td>";
        echo "<td style='border: 1px solid #ddd; padding: 8px;'>{$member['role']}</td>";
        echo "<td style='border: 1px solid #ddd; padding: 8px;'>{$member['unit']}</td>";
        echo "<td style='border: 1px solid #ddd; padding: 8px;'>" . (isset($member['entitlements']) ? $member['entitlements'] : 'N/A') . "</td>";
        echo "</tr>";
      }
      echo "</table>";
      
      // Generate a simple chart using PHP
      echo "<h3>Entitlements Distribution</h3>";
      echo "<div style='display: flex; height: 200px; align-items: flex-end; margin-top: 20px;'>";
      
      foreach ($committeeMembers as $index => $member) {
        if (isset($member['entitlements'])) {
          $height = ($member['entitlements'] / 20) * 100;
          $color = sprintf('#%06X', mt_rand(0, 0xFFFFFF));
          echo "<div style='flex: 1; margin: 0 5px; background-color: $color; height: {$height}%; position: relative;'>";
          echo "<span style='position: absolute; bottom: -25px; left: 0; right: 0; text-align: center; font-size: 12px;'>{$member['name']}</span>";
          echo "<span style='position: absolute; top: -20px; left: 0; right: 0; text-align: center; font-size: 12px;'>{$member['entitlements']}</span>";
          echo "</div>";
        }
      }
      
      echo "</div>";
      
      echo "<p style='margin-top: 40px;'>Generated with PHP on " . date('Y-m-d H:i:s') . "</p>";
      echo "</div>";
    ?>`

    // Write the PHP code to the temporary file
    fs.writeFileSync(phpFilePath, phpCode)

    // Execute the PHP code
    const { stdout, stderr } = await execPromise(`php ${phpFilePath}`)

    if (stderr) {
      console.error("PHP Error:", stderr)
      return NextResponse.json({ error: "PHP execution error" }, { status: 500 })
    }

    // Clean up the temporary file
    fs.unlinkSync(phpFilePath)

    // Return the PHP output as HTML
    return new NextResponse(stdout, {
      headers: {
        "Content-Type": "text/html",
      },
    })
  } catch (error) {
    console.error("Error executing PHP:", error)
    return NextResponse.json({ error: "Failed to execute PHP" }, { status: 500 })
  }
}
