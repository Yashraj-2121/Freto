const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({path: '../.env'});

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SECRET_KEY);

async function run() {
  // Add driver_id to trucks
  let res = await supabase.rpc('exec_sql', {
    sql: `ALTER TABLE trucks ADD COLUMN IF NOT EXISTS driver_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;`
  });
  console.log("Alter table:", res);

  // Create RPC for finding driver by email
  let res2 = await supabase.rpc('exec_sql', {
    sql: `
      CREATE OR REPLACE FUNCTION get_driver_by_email(driver_email TEXT)
      RETURNS UUID AS $$
      DECLARE
        found_id UUID;
      BEGIN
        SELECT id INTO found_id FROM auth.users 
        WHERE email = driver_email 
          AND raw_user_meta_data->>'role' = 'DRIVER' 
        LIMIT 1;
        RETURN found_id;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `
  });
  console.log("Create Function:", res2);
}
run();
