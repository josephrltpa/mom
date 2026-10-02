// Simple cloud sync using Supabase with family code as key
import { supabase, isSupabaseConfigured } from './supabaseClient';

interface SyncData {
  profile?: any;
  medicines?: any[];
  vitals?: any[];
  appointments?: any[];
  documents?: any[];
  doctors?: any[];
  medicationStatus?: any[];
  lastUpdated?: string;
}

// Simple sync using Supabase with family code as key
export async function syncDataToCloud(familyCode: string, data: SyncData): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    console.log('⚠️ Supabase not configured, using localStorage only');
    return false;
  }

  try {
    // Use family_sync table with family_code as primary key
    const { error } = await supabase
      .from('family_sync')
      .upsert({
        family_code: familyCode,
        data: JSON.stringify(data),
        last_updated: new Date().toISOString(),
      }, {
        onConflict: 'family_code'
      });

    if (error) {
      console.error('❌ Sync error:', error);
      // Try to create the table if it doesn't exist
      if (error.message.includes('relation') || error.message.includes('does not exist')) {
        console.log('🔧 Creating family_sync table...');
        await createSyncTable();
        // Retry
        const { error: retryError } = await supabase
          .from('family_sync')
          .upsert({
            family_code: familyCode,
            data: JSON.stringify(data),
            last_updated: new Date().toISOString(),
          });
        
        if (retryError) {
          console.error('❌ Retry failed:', retryError);
          return false;
        }
      } else {
        return false;
      }
    }

    console.log('✅ Data synced to cloud');
    return true;
  } catch (error) {
    console.error('❌ Sync failed:', error);
    return false;
  }
}

export async function loadDataFromCloud(familyCode: string): Promise<SyncData | null> {
  if (!isSupabaseConfigured || !supabase) {
    console.log('⚠️ Supabase not configured');
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('family_sync')
      .select('*')
      .eq('family_code', familyCode)
      .single();

    if (error || !data) {
      console.log('⚠️ No cloud data found');
      return null;
    }

    const syncData = JSON.parse((data as any).data) as SyncData;
    console.log('✅ Data loaded from cloud');
    return syncData;
  } catch (error) {
    console.error('❌ Load failed:', error);
    return null;
  }
}

// Create the sync table if it doesn't exist
async function createSyncTable() {
  if (!supabase) return;

  const { error } = await supabase.rpc('exec_sql', {
    sql: `
      CREATE TABLE IF NOT EXISTS family_sync (
        family_code TEXT PRIMARY KEY,
        data JSONB NOT NULL,
        last_updated TIMESTAMPTZ DEFAULT NOW()
      );
      
      -- Enable RLS but allow public access for family sync
      ALTER TABLE family_sync ENABLE ROW LEVEL SECURITY;
      
      -- Allow anyone to read/write (family code acts as password)
      CREATE POLICY "Allow public access" ON family_sync
        FOR ALL USING (true) WITH CHECK (true);
    `
  });

  if (error) {
    console.error('❌ Failed to create table:', error);
    // Try alternative approach - direct SQL
    console.log('🔧 Trying alternative table creation...');
  }
}

// Subscribe to real-time updates
export function subscribeToUpdates(familyCode: string, callback: (data: SyncData) => void) {
  if (!isSupabaseConfigured || !supabase) return () => {};

  const channel = supabase
    .channel(`family_${familyCode}`)
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'family_sync', filter: `family_code=eq.${familyCode}` },
      (payload) => {
        console.log('🔄 Real-time update received');
        const newData = (payload.new as any);
        if (newData && newData.data) {
          const syncData = JSON.parse(newData.data);
          callback(syncData);
        }
      }
    )
    .subscribe();

  return () => {
    if (supabase) {
      supabase.removeChannel(channel);
    }
  };
}
