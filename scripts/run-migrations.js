#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables manually
const envPath = path.join(__dirname, '..', '.env.local')
const envContent = fs.readFileSync(envPath, 'utf8')
const env = {}

envContent.split('\n').forEach(line => {
  const match = line.match(/^([^#=]+)=(.*)$/)
  if (match) {
    env[match[1]] = match[2]
  }
})

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase configuration')
  console.error('Please check your .env.local file')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Create schema_migrations table if it doesn't exist
const createMigrationsTable = async () => {
  const { error } = await supabase.rpc('sql', {
    query: `
      CREATE TABLE IF NOT EXISTS schema_migrations (
        version TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        executed_at TIMESTAMPTZ DEFAULT NOW()
      );
    `
  })
  
  if (error) {
    console.error('❌ Failed to create migrations table:', error.message)
    return false
  }
  
  return true
}

// Get executed migrations
const getExecutedMigrations = async () => {
  const { data, error } = await supabase
    .from('schema_migrations')
    .select('version')
  
  if (error) {
    console.log('ℹ️  No migrations table found, will create it')
    return []
  }
  
  return data.map(row => row.version)
}

// Run a single migration
const runMigration = async (migrationFile) => {
  const filePath = path.join(__dirname, '..', 'supabase', 'migrations', migrationFile)
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ Migration file not found: ${migrationFile}`)
    return false
  }
  
  const sql = fs.readFileSync(filePath, 'utf8')
  console.log(`🔄 Running migration: ${migrationFile}`)
  
  try {
    // Split SQL by statements and execute them
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    for (const statement of statements) {
      if (statement.trim()) {
        const { error } = await supabase.rpc('sql', { query: statement })
        if (error) {
          console.error(`❌ Error in statement: ${statement.substring(0, 100)}...`)
          console.error('Error:', error.message)
          return false
        }
      }
    }
    
    console.log(`✅ Migration completed: ${migrationFile}`)
    return true
  } catch (error) {
    console.error(`❌ Failed to run migration ${migrationFile}:`, error.message)
    return false
  }
}

// Main migration runner
const runMigrations = async () => {
  console.log('🚀 Starting database migrations...')
  
  // Create migrations table
  const migrationsTableCreated = await createMigrationsTable()
  if (!migrationsTableCreated) {
    return
  }
  
  // Get list of migration files
  const migrationsDir = path.join(__dirname, '..', 'supabase', 'migrations')
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort()
  
  // Get executed migrations
  const executedMigrations = await getExecutedMigrations()
  
  console.log(`📁 Found ${migrationFiles.length} migration files`)
  console.log(`✅ Already executed: ${executedMigrations.length} migrations`)
  
  // Run pending migrations
  let runCount = 0
  for (const migrationFile of migrationFiles) {
    const version = migrationFile.replace('.sql', '').split('_')[0]
    
    if (executedMigrations.includes(version)) {
      console.log(`⏭️  Skipping already executed: ${migrationFile}`)
      continue
    }
    
    const success = await runMigration(migrationFile)
    if (success) {
      runCount++
    } else {
      console.error(`❌ Migration failed: ${migrationFile}`)
      process.exit(1)
    }
  }
  
  if (runCount === 0) {
    console.log('✨ No new migrations to run')
  } else {
    console.log(`🎉 Successfully ran ${runCount} new migrations`)
  }
  
  console.log('✅ Migration process completed')
}

// Run migrations
runMigrations().catch(error => {
  console.error('❌ Migration process failed:', error)
  process.exit(1)
})