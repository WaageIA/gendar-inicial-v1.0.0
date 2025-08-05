import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { businessSlug, serviceId, date, professionalId } = await req.json()

    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Get business user_id
    const { data: profileData, error: profileError } = await supabaseClient
      .from('profiles')
      .select('user_id')
      .eq('business_slug', businessSlug)
      .single()

    if (profileError || !profileData) {
      return new Response(
        JSON.stringify({ error: 'Business not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get service details
    const { data: serviceData, error: serviceError } = await supabaseClient
      .from('services')
      .select('duration')
      .eq('id', serviceId)
      .single()

    if (serviceError || !serviceData) {
      return new Response(
        JSON.stringify({ error: 'Service not found' }),
        { 
          status: 404, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Get existing appointments for the date
    const targetDate = new Date(date)
    const startOfDay = new Date(targetDate)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(targetDate)
    endOfDay.setHours(23, 59, 59, 999)

    let appointmentsQuery = supabaseClient
      .from('appointments')
      .select('date, duration')
      .eq('user_id', profileData.user_id)
      .eq('status', 'scheduled')
      .gte('date', startOfDay.toISOString())
      .lte('date', endOfDay.toISOString())

    // Filter by professional if specified
    if (professionalId) {
      appointmentsQuery = appointmentsQuery.eq('professional_id', professionalId)
    }

    const { data: appointments, error: appointmentsError } = await appointmentsQuery

    if (appointmentsError) {
      return new Response(
        JSON.stringify({ error: appointmentsError.message }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Generate available slots
    const slots = generateTimeSlots(targetDate, serviceData.duration, appointments || [])

    return new Response(
      JSON.stringify({ slots }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})

function generateTimeSlots(date: Date, serviceDuration: number, existingAppointments: any[]) {
  const slots = []
  const now = new Date()
  
  // Business hours: 9:00 to 18:00
  const startHour = 9
  const endHour = 18
  const slotInterval = 30 // 30 minutes intervals
  
  // Create slots for the day
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += slotInterval) {
      const slotTime = new Date(date)
      slotTime.setHours(hour, minute, 0, 0)
      
      // Skip past times for today
      if (isSameDay(date, now) && slotTime < now) {
        continue
      }
      
      // Check if slot would end after business hours
      const slotEnd = new Date(slotTime.getTime() + serviceDuration * 60000)
      const businessEnd = new Date(date)
      businessEnd.setHours(endHour, 0, 0, 0)
      
      if (slotEnd > businessEnd) {
        continue
      }
      
      // Check for conflicts with existing appointments
      const hasConflict = existingAppointments.some(appointment => {
        const appointmentStart = new Date(appointment.date)
        const appointmentEnd = new Date(appointmentStart.getTime() + appointment.duration * 60000)
        
        return (slotTime < appointmentEnd && slotEnd > appointmentStart)
      })
      
      slots.push({
        time: slotTime.toTimeString().slice(0, 5), // HH:MM format
        available: !hasConflict,
        reason: hasConflict ? 'Horário ocupado' : undefined
      })
    }
  }
  
  return slots
}

function isSameDay(date1: Date, date2: Date): boolean {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate()
}