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
    
    // Check if bulk import (Array of objects)
    if (Array.isArray(body)) {
      const validItems = body.filter(item => item.name && item.tokenNumber);
      
      if (validItems.length === 0) {
        return NextResponse.json({ success: false, error: 'কোনো বৈধ পরিবার পাওয়া যায়নি।' }, { status: 400 });
      }
      
      // Fetch all existing tokens to filter duplicates
      const existingTokens = new Set(
        (await Beneficiary.find({}, 'tokenNumber')).map(b => b.tokenNumber)
      );
      
      const importList: any[] = [];
      const seenTokensInImport = new Set<string>();
      
      for (const item of validItems) {
        const token = item.tokenNumber.toString().trim();
        if (!existingTokens.has(token) && !seenTokensInImport.has(token)) {
          seenTokensInImport.add(token);
          importList.push({
            name: item.name.trim(),
            tokenNumber: token,
            phone: item.phone ? item.phone.toString().trim() : '',
            address: item.address ? item.address.trim() : '',
            notes: item.notes ? item.notes.trim() : '',
            isDistributed: false
          });
        }
      }
      
      if (importList.length === 0) {
        return NextResponse.json({ success: false, error: 'সবগুলো টোকেন নম্বর ইতিমধ্যেই ব্যবহৃত হচ্ছে!' }, { status: 400 });
      }
      
      const inserted = await Beneficiary.insertMany(importList);
      return NextResponse.json({ 
        success: true, 
        message: `${inserted.length} টি পরিবার সফলভাবে ইম্পোর্ট করা হয়েছে!`,
        data: inserted 
      }, { status: 201 });
    }
    
    // Single item import
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
