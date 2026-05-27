import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Beneficiary from '@/models/Beneficiary';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    
    if (body.tokenNumber) {
      const existing = await Beneficiary.findOne({ 
        tokenNumber: body.tokenNumber,
        _id: { $ne: id }
      });
      if (existing) {
        return NextResponse.json({ success: false, error: 'এই টোকেন নম্বরটি অন্য একটি পরিবারের জন্য ব্যবহৃত হচ্ছে।' }, { status: 400 });
      }
    }
    
    const beneficiary = await Beneficiary.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });
    
    if (!beneficiary) {
      return NextResponse.json({ success: false, error: 'পরিবারটি খুঁজে পাওয়া যায়নি।' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, data: beneficiary });
  } catch (error: any) {
    console.error('Error updating beneficiary:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    
    const beneficiary = await Beneficiary.findByIdAndDelete(id);
    
    if (!beneficiary) {
      return NextResponse.json({ success: false, error: 'পরিবারটি খুঁজে পাওয়া যায়নি।' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, message: 'পরিবারটি সফলভাবে ডিলিট করা হয়েছে।' });
  } catch (error: any) {
    console.error('Error deleting beneficiary:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
