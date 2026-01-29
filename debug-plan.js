// Debug script to check plan data
const { neon } = require('@neondatabase/serverless');

async function checkPlans() {
  const sql = neon(process.env.DATABASE_URL);
  
  try {
    // Get the most recent plan
    const plans = await sql`SELECT * FROM business_plans ORDER BY created_at DESC LIMIT 1`;
    console.log('Recent plans:', plans.length);
    
    if (plans.length > 0) {
      const plan = plans[0];
      console.log('Plan ID:', plan.id);
      console.log('Status:', plan.status);
      console.log('Business Description:', plan.business_description?.slice(0, 100));
      
      // Check each section
      const sections = [
        'executive_summary',
        'market_analysis', 
        'competitive_analysis',
        'customer_analysis',
        'financial_projections',
        'marketing_strategy',
        'operations_plan',
        'risk_analysis',
        'legal_compliance'
      ];
      
      console.log('\nSections status:');
      sections.forEach(section => {
        const data = plan[section];
        console.log(`${section}: ${data ? 'HAS DATA' : 'NULL/EMPTY'} (${typeof data})`);
        if (data && typeof data === 'object') {
          console.log(`  Keys: ${Object.keys(data).join(', ')}`);
        }
      });
      
      // Check confidence
      console.log('\nConfidence:', plan.confidence);
    }
  } catch (error) {
    console.error('Database error:', error);
  }
}

// Load environment variables
require('dotenv').config({ path: '.env.local' });
checkPlans();