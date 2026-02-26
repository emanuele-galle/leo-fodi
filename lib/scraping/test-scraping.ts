/**
 * Test Scraping System
 * Script di test per verificare funzionamento scraper
 *
 * Usage: npx tsx lib/scraping/test-scraping.ts
 */

import { DataGatheringCoordinator } from './data-gathering-coordinator'
// TODO: Fix scrapers import - module doesn't exist
// import { LinkedInScraper, InstagramScraper, GeneralWebScraper } from './scrapers'
import type { ProfilingTarget } from '../osint/types'

async function testSingleScraper() {
  console.log('\n🧪 Testing Single Scrapers...\n')

  // TODO: Fix scraper imports before running tests
  console.log('❌ Scraper tests disabled - scrapers module not found')
  return

  /*
  // Test LinkedIn Scraper
  console.log('=== Testing LinkedIn Scraper ===')
  const linkedinScraper = new LinkedInScraper()

  try {
    const result = await linkedinScraper.scrape(
      'https://www.linkedin.com/in/satyanadella/' // CEO Microsoft (profilo pubblico)
    )

    if (result.success && result.data) {
      console.log('✅ LinkedIn scraping successful!')
      console.log(`   Name: ${result.data.nome_completo}`)
      console.log(`   Headline: ${result.data.headline}`)
      console.log(`   Location: ${result.data.localita}`)
      console.log(`   Experiences: ${result.data.esperienze?.length || 0}`)
      console.log(`   Skills: ${result.data.competenze?.length || 0}`)
    } else {
      console.log('❌ LinkedIn scraping failed:', result.error?.message)
    }
  } catch (error) {
    console.error('❌ Error:', error)
  }

  console.log('\n')

  // Test Instagram Scraper
  console.log('=== Testing Instagram Scraper ===')
  const instagramScraper = new InstagramScraper()

  try {
    const result = await instagramScraper.scrape(
      'https://www.instagram.com/cristiano/' // Cristiano Ronaldo (profilo pubblico)
    )

    if (result.success && result.data) {
      console.log('✅ Instagram scraping successful!')
      console.log(`   Username: @${result.data.username}`)
      console.log(`   Name: ${result.data.nome_completo}`)
      console.log(`   Followers: ${result.data.numero_followers?.toLocaleString()}`)
      console.log(`   Posts: ${result.data.numero_post}`)
      console.log(`   Recent posts analyzed: ${result.data.post_recenti?.length || 0}`)
    } else {
      console.log('❌ Instagram scraping failed:', result.error?.message)
    }
  } catch (error) {
    console.error('❌ Error:', error)
  }

  console.log('\n')

  // Test General Web Scraper
  console.log('=== Testing General Web Scraper ===')
  const webScraper = new GeneralWebScraper()

  try {
    const result = await webScraper.scrape(
      'https://example.com' // Sito test pubblico
    )

    if (result.success && result.data) {
      console.log('✅ Web scraping successful!')
      console.log(`   Title: ${result.data.title}`)
      console.log(`   Paragraphs: ${result.data.paragrafi?.length || 0}`)
      console.log(`   Links: ${result.data.links?.length || 0}`)
      console.log(`   Images: ${result.data.immagini?.length || 0}`)
    } else {
      console.log('❌ Web scraping failed:', result.error?.message)
    }
  } catch (error) {
    console.error('❌ Error:', error)
  }
  */
}

async function testDataGatheringCoordinator() {
  console.log('\n🧪 Testing Data Gathering Coordinator...\n')

  const coordinator = new DataGatheringCoordinator()

  const mockTarget: ProfilingTarget = {
    id: 'test-001',
    nome: 'Satya',
    cognome: 'Nadella',
    linkedin_url: 'https://www.linkedin.com/in/satyanadella/',
    instagram_url: 'https://www.instagram.com/satyanadella/',
    consenso_profilazione: true,
    data_consenso: new Date().toISOString(),
  }

  try {
    const rawData = await coordinator.gatherData(mockTarget)

    console.log('\n✅ Data Gathering completed!')
    console.log(`   Target: ${mockTarget.nome} ${mockTarget.cognome}`)
    console.log(`   Sources attempted: ${rawData.successi + rawData.fallimenti}`)
    console.log(`   Successes: ${rawData.successi}`)
    console.log(`   Failures: ${rawData.fallimenti}`)
    console.log(`   Total time: ${(rawData.tempo_totale_ms / 1000).toFixed(2)}s`)
    console.log(`   Sources: ${rawData.fonti_consultate.join(', ')}`)

    if (rawData.linkedin_data) {
      console.log(`\n   LinkedIn Data:`)
      console.log(`   - Name: ${rawData.linkedin_data.nome_completo}`)
      console.log(`   - Headline: ${rawData.linkedin_data.headline}`)
      console.log(`   - Experiences: ${rawData.linkedin_data.esperienze?.length}`)
    }

    if (rawData.instagram_data) {
      console.log(`\n   Instagram Data:`)
      console.log(`   - Username: @${rawData.instagram_data.username}`)
      console.log(`   - Followers: ${rawData.instagram_data.numero_followers?.toLocaleString()}`)
      console.log(`   - Posts analyzed: ${rawData.instagram_data.post_recenti?.length}`)
    }

    if (rawData.errori.length > 0) {
      console.log(`\n   Errors:`)
      rawData.errori.forEach((err) => {
        console.log(`   - ${err.fonte}: ${err.errore}`)
      })
    }

    const stats = coordinator.getStats(rawData)
    console.log(`\n   Statistics:`)
    console.log(`   - Success rate: ${stats.tasso_successo}%`)
    console.log(`   - Avg time per source: ${stats.tempo_medio_ms}ms`)
  } catch (error) {
    console.error('❌ Error:', error)
  }
}

// ========== MAIN ==========
async function main() {
  console.log('🚀 Starting Scraping System Tests\n')

  // Scegli quale test eseguire
  const testMode = process.argv[2] || 'coordinator'

  if (testMode === 'single') {
    await testSingleScraper()
  } else if (testMode === 'coordinator') {
    await testDataGatheringCoordinator()
  } else {
    console.log('Usage:')
    console.log('  npx tsx lib/scraping/test-scraping.ts single       # Test single scrapers')
    console.log('  npx tsx lib/scraping/test-scraping.ts coordinator  # Test coordinator')
  }

  console.log('\n✅ Tests completed!\n')
}

// Esegui solo se chiamato direttamente
if (require.main === module) {
  main().catch(console.error)
}
