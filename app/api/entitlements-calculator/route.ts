import { NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"
import fs from "fs"
import path from "path"
import os from "os"

const execPromise = promisify(exec)

// Fallback function to simulate PHP output when PHP execution fails
function generateFallbackOutput(data: any) {
  const { buildingName, unitsCount, committeeMembers } = data

  // Calculate total entitlements
  const totalEntitlements = committeeMembers.reduce(
    (sum: number, member: any) => sum + (Number.parseInt(member.entitlements) || 0),
    0,
  )

  // Generate HTML similar to what PHP would produce
  let html = `
    <div style="font-family: system-ui, sans-serif;">
      <h2 style="color: #333;">${buildingName}</h2>
      <p>Number of units: ${unitsCount}</p>
      <p>Total committee entitlements: ${totalEntitlements}</p>
      
      <h3>Strata Committee Members</h3>
      <table style="border-collapse: collapse; width: 100%;">
        <tr style="background-color: #f2f2f2;">
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Name</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Role</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Unit</th>
          <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Entitlements</th>
        </tr>
  `

  // Add rows for each committee member
  committeeMembers.forEach((member: any) => {
    html += `
      <tr>
        <td style="border: 1px solid #ddd; padding: 8px;">${member.name}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${member.role}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${member.unit}</td>
        <td style="border: 1px solid #ddd; padding: 8px;">${member.entitlements || "N/A"}</td>
      </tr>
    `
  })

  html += `</table>`

  // Generate a simple chart
  html += `
    <h3>Entitlements Distribution</h3>
    <div style="display: flex; height: 200px; align-items: flex-end; margin-top: 20px;">
  `

  // Add bars for each committee member
  committeeMembers.forEach((member: any, index: number) => {
    if (member.entitlements) {
      const height = (Number.parseInt(member.entitlements) / 20) * 100
      const color = `hsl(${index * 50}, 70%, 60%)`
      html += `
        <div style="flex: 1; margin: 0 5px; background-color: ${color}; height: ${height}%; position: relative;">
          <span style="position: absolute; bottom: -25px; left: 0; right: 0; text-align: center; font-size: 12px;">${member.name}</span>
          <span style="position: absolute; top: -20px; left: 0; right: 0; text-align: center; font-size: 12px;">${member.entitlements}</span>
        </div>
      `
    }
  })

  html += `
    </div>
    <p style="margin-top: 40px;">Generated on ${new Date().toLocaleString()}</p>
  </div>
  `

  return html
}

export async function POST(request: Request) {
  try {
    // Get data from request
    const data = await request.json()

    try {
      // Try to execute PHP if available
      const tempDir = os.tmpdir()
      const phpFilePath = path.join(tempDir, "entitlements.php")

      // Create simplified PHP code
      const phpCode = `<?php
        $data = json_decode('${JSON.stringify(data)}', true);
        $buildingName = $data['buildingName'];
        $unitsCount = $data['unitsCount'];
        $committeeMembers = $data['committeeMembers'];
        
        // Calculate total entitlements
        $totalEntitlements = 0;
        foreach ($committeeMembers as $member) {
          $totalEntitlements += (int)$member['entitlements'];
        }
        
        // Output HTML
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
          echo "<td style='border: 1px solid #ddd; padding: 8px;'>{$member['entitlements']}</td>";
          echo "</tr>";
        }
        echo "</table>";
        
        echo "</div>";
      ?>`

      // Write PHP code to temp file
      fs.writeFileSync(phpFilePath, phpCode)

      // Try to execute PHP
      const { stdout, stderr } = await execPromise(`php ${phpFilePath}`)

      // Clean up
      try {
        fs.unlinkSync(phpFilePath)
      } catch (e) {
        console.error("Failed to delete temp file:", e)
      }

      if (stderr) {
        console.warn("PHP Warning:", stderr)
        // Continue with execution if there are only warnings
      }

      // If we got output, return it
      if (stdout) {
        return new NextResponse(stdout, {
          headers: { "Content-Type": "text/html" },
        })
      }

      // If no output but no error, use fallback
      console.log("No PHP output, using fallback")
      const fallbackOutput = generateFallbackOutput(data)
      return new NextResponse(fallbackOutput, {
        headers: { "Content-Type": "text/html" },
      })
    } catch (phpError) {
      // PHP execution failed, use fallback
      console.error("PHP execution failed:", phpError)
      console.log("Using fallback mechanism")
      const fallbackOutput = generateFallbackOutput(data)
      return new NextResponse(fallbackOutput, {
        headers: { "Content-Type": "text/html" },
      })
    }
  } catch (error) {
    console.error("Request processing error:", error)
    return NextResponse.json(
      { error: "Failed to process entitlements calculation", details: String(error) },
      { status: 500 },
    )
  }
}
