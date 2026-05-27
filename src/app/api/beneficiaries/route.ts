import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Beneficiary from '@/models/Beneficiary';

export async function GET() {
  try {
    await dbConnect();
    const beneficiaries = await Beneficiary.find({}).sort({ tokenNumber: 1 });
    return NextResponse.json({ success: true, data: beneficiaries });
  } catch (error: any) {
    console.error('Error fetching beneficiaries:', error);
    return NextResponse.json({ success: true, data: [], error: error.message });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();
    
    if (!body.name || !body.tokenNumber) {
      return NextResponse.json({ success: false, error: 'নাম এবং টোকেন নম্বর অবশ্যক।' }, { status: 400 });
    }
    
    const existing = await Beneficiary.findOne({ tokenNumber: body.tokenNumber });
    if (existing) {
      return NextResponse.json({ success: false, error: 'এই টোকেন নম্বরটি ইতিমধ্যেই ব্যবহৃত হচ্ছে।' }, { status: 400 });
    }
    
    const beneficiary = await Beneficiary.create(body);
    return NextResponse.json({ success: true, data: beneficiary }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating beneficiary:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
