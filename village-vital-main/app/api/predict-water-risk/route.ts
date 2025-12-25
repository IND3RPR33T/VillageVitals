// app/api/predict-water-risk/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import path from 'path'

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { coliform, turbidity, bod, cod, nitrate, ammonia } = data

    // Validate input data
    if (!coliform || !turbidity || !bod || !cod || !nitrate || !ammonia) {
      return NextResponse.json(
        { error: 'Missing required parameters', status: 'error' },
        { status: 400 }
      )
    }

    // Path to your Python script (create this in the project root)
    const scriptPath = path.join(process.cwd(), 'scripts', 'predict_water_quality.py')
    
    const prediction = await runPythonScript(scriptPath, [
      coliform.toString(),
      turbidity.toString(),
      bod.toString(),
      cod.toString(),
      nitrate.toString(),
      ammonia.toString()
    ])

    return NextResponse.json(prediction)

  } catch (error) {
    console.error('API Error:', error)
    return NextResponse.json(
      { error: 'Internal server error', status: 'error' },
      { status: 500 }
    )
  }
}

function runPythonScript(scriptPath: string, args: string[]): Promise<any> {
  return new Promise((resolve, reject) => {
    const pythonProcess = spawn('python', [scriptPath, ...args])
    
    let result = ''
    let error = ''

    pythonProcess.stdout.on('data', (data) => {
      result += data.toString()
    })

    pythonProcess.stderr.on('data', (data) => {
      error += data.toString()
    })

    pythonProcess.on('close', (code) => {
      if (code === 0) {
        try {
          const parsedResult = JSON.parse(result.trim())
          resolve(parsedResult)
        } catch (parseError) {
          reject(new Error(`Failed to parse Python output: ${result}`))
        }
      } else {
        reject(new Error(`Python script failed with code ${code}: ${error}`))
      }
    })

    pythonProcess.on('error', (err) => {
      reject(new Error(`Failed to start Python process: ${err.message}`))
    })

    // Set timeout to prevent hanging
    setTimeout(() => {
      pythonProcess.kill()
      reject(new Error('Python script timeout'))
    }, 30000) // 30 seconds timeout
  })
}