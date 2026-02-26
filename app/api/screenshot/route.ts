/**
 * API Route: Screenshot Server
 * Serve local screenshots salvati da Puppeteer per la visualizzazione nell'interfaccia
 */

import { NextRequest, NextResponse } from 'next/server'
import * as fs from 'fs/promises'
import * as path from 'path'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const screenshotPath = searchParams.get('path')

    if (!screenshotPath) {
      return NextResponse.json({ error: 'Missing path parameter' }, { status: 400 })
    }

    // Security: Verifica che il path sia nella directory temp/screenshots
    const absolutePath = path.resolve(screenshotPath)
    const tempDir = path.resolve(process.cwd(), 'temp')

    if (!absolutePath.startsWith(tempDir)) {
      console.error(`[Screenshot API] ❌ Security: Path outside temp directory: ${absolutePath}`)
      return NextResponse.json({ error: 'Invalid path' }, { status: 403 })
    }

    // Verifica che il file esista
    try {
      await fs.access(absolutePath)
    } catch {
      console.error(`[Screenshot API] ❌ File not found: ${absolutePath}`)
      return NextResponse.json({ error: 'Screenshot not found' }, { status: 404 })
    }

    // Leggi il file
    const fileBuffer = await fs.readFile(absolutePath)

    // Determina il MIME type dall'estensione
    const ext = path.extname(absolutePath).toLowerCase()
    const mimeTypes: Record<string, string> = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
    }
    const contentType = mimeTypes[ext] || 'application/octet-stream'

    // Ritorna l'immagine con cache headers
    return new NextResponse(Uint8Array.from(fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache 1 anno
      },
    })
  } catch (error: any) {
    console.error(`[Screenshot API] ❌ Error serving screenshot:`, error)
    return NextResponse.json(
      { error: 'Failed to serve screenshot', details: error.message },
      { status: 500 }
    )
  }
}
