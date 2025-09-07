import { NextRequest, NextResponse } from 'next/server'
import { everflowRequest } from '@/lib/everflow-api'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Default values
    const {
      from = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days ago
      to = new Date().toISOString().split('T')[0], // today
      timezone_id = 90, // UTC
      currency_id = "USD",
      columns = [{ column: "offer" }, { column: "affiliate" }],
      query = { filters: [], exclusions: [], settings: {} },
      endpoint = "table" // table, summary, or export
    } = body

    const requestBody: any = {
      from,
      to,
      timezone_id,
      currency_id,
      columns,
      query
    }

    // Add format for export endpoint
    if (endpoint === "export") {
      requestBody.format = body.format || "json"
    }

    // Use the correct Everflow reporting endpoints
    let apiEndpoint = ''
    switch (endpoint) {
      case 'table':
        apiEndpoint = 'reporting/entity/table'
        break
      case 'summary':
        apiEndpoint = 'reporting/entity/summary'
        break
      case 'export':
        apiEndpoint = 'reporting/entity/table/export'
        break
      default:
        throw new Error(`Unsupported endpoint: ${endpoint}`)
    }
    
    const result = await everflowRequest(apiEndpoint, 'POST', requestBody)

    // Process the response based on endpoint type
    let processedData
    if (endpoint === 'summary') {
      processedData = processSummaryData(result)
    } else if (endpoint === 'table') {
      processedData = processTableData(result)
    } else {
      processedData = result
    }
    
    return NextResponse.json({
      success: true,
      data: processedData,
      metadata: {
        from,
        to,
        timezone_id,
        currency_id,
        columns,
        endpoint,
        timestamp: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Reporting API Error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const from = searchParams.get('from')
  const to = searchParams.get('to')
  
  if (!from || !to) {
    return NextResponse.json({
      success: false,
      error: 'from and to parameters are required',
      timestamp: new Date().toISOString()
    }, { status: 400 })
  }
  
  try {
    const result = await everflowRequest(`reportingadjustments?from=${from}&to=${to}`, 'GET')
    
    return NextResponse.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Reporting Adjustments API Error:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

function processSummaryData(data: any) {
  if (!data) return null

  // Process the summary response from Everflow API
  const metrics = {
    totalClicks: data.total_click || 0,
    uniqueClicks: data.unique_click || 0,
    conversions: data.cv || 0,
    conversionRate: data.cvr ? data.cvr.toFixed(2) : '0.00',
    payout: data.payout || 0,
    revenue: data.revenue || 0,
    profit: data.profit || 0,
    grossSales: data.gross_sales || 0,
    impressions: data.imp || 0,
    mediaBuyingCost: data.media_buying_cost || 0
  }

  return {
    ...data,
    metrics
  }
}

function processTableData(data: any) {
  if (!data || !data.table || !Array.isArray(data.table)) return []

  return data.table.map((row: any) => {
    const reporting = row.reporting || {}
    const columns = row.columns || []
    
    // Extract column data
    const processedRow: any = {
      total_clicks: reporting.total_click || 0,
      unique_clicks: reporting.unique_click || 0,
      conversions: reporting.cv || 0,
      payout: reporting.payout || 0,
      revenue: reporting.revenue || 0,
      profit: reporting.profit || 0,
      gross_sales: reporting.gross_sales || 0,
      impressions: reporting.imp || 0,
      media_buying_cost: reporting.media_buying_cost || 0
    }

    // Add calculated metrics
    processedRow.conversionRate = processedRow.total_clicks > 0 
      ? ((processedRow.conversions / processedRow.total_clicks) * 100).toFixed(2) 
      : '0.00'
    processedRow.ctr = processedRow.impressions > 0 
      ? ((processedRow.total_clicks / processedRow.impressions) * 100).toFixed(2) 
      : '0.00'
    processedRow.epc = processedRow.total_clicks > 0 
      ? (processedRow.payout / processedRow.total_clicks).toFixed(2) 
      : '0.00'
    processedRow.rpc = processedRow.total_clicks > 0 
      ? (processedRow.revenue / processedRow.total_clicks).toFixed(2) 
      : '0.00'

    // Extract column information
    columns.forEach((col: any) => {
      switch (col.column_type) {
        case 'offer':
          processedRow.offer = {
            network_offer_id: parseInt(col.id),
            name: col.label
          }
          break
        case 'affiliate':
          processedRow.affiliate = {
            network_affiliate_id: parseInt(col.id),
            name: col.label
          }
          break
        case 'advertiser':
          processedRow.advertiser = {
            network_advertiser_id: parseInt(col.id),
            name: col.label
          }
          break
      }
    })

    return processedRow
  })
}


