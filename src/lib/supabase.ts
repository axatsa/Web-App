
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://usatbokjphhscygveqsv.supabase.co';
const supabaseKey = 'sb_publishable_T8sOwYq6jA3AWbO70_n0ww_AW706_b4';

export const supabase = createClient(supabaseUrl, supabaseKey);
