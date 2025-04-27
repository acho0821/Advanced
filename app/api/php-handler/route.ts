import { NextResponse } from "next/server"
import { exec } from "child_process"
import { promisify } from "util"
import fs from "fs"
import path from "path"
import os from "os"

const execPromise = promisify(exec)

export async function GET() {
  try {
    // Create a temporary PHP file
    const tempDir = os.tmpdir()
    const phpFilePath = path.join(tempDir, "temp.php")

    // PHP code to execute
    const phpCode = `<?php
      // Sample PHP code for strata management
      $buildingName = "Oceanview Apartments";
      $unitsCount = 24;
      $committeeMembers = [
        ["name" => "John Smith", "role" => "Chairperson"],
        ["name" => "Sarah Johnson", "role" => "Secretary"],
        ["name" => "Michael Wong", "role" => "Treasurer"]
      ];
      
      echo "<div style='font-family: system-ui, sans-serif;'>";
      echo "<h2 style='color: #333;'>$buildingName</h2>";
      echo "<p>Number of units: $unitsCount</p>";
      
      echo "<h3>Strata Committee Members</h3>";
      echo "<ul>";
      foreach ($committeeMembers as $member) {
        echo "<li><strong>{$member['name']}</strong> - {$member['role']}</li>";
      }
      echo "</ul>";
      
      echo "<p>Current date and time: " . date('Y-m-d H:i:s') . "</p>";
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
