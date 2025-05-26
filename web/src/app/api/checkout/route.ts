import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { productId } = body;

    console.log("Product ID:", productId);

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    // Determine if the app is in test mode
    const isTestMode = process.env.NODE_ENV === 'development' || process.env.TEST_MODE === 'true';

    // Use the correct API endpoint depending on the environment
    const creemApiUrl = isTestMode
      ? 'https://test-api.creem.io/v1/checkouts'
      : 'https://api.creem.io/v1/checkouts';

    const creemResponse = await axios.post(
      creemApiUrl,
      {
        product_id: productId,
      },
      {
        headers: {
          'x-api-key': process.env.CREEM_API_KEY!,
        },
      }
    );

    const checkoutUrl = creemResponse.data?.checkout_url;

    if (!checkoutUrl) {
      return NextResponse.json({ error: 'No checkout URL returned' }, { status: 500 });
    }

    return NextResponse.json({ url: checkoutUrl });
  } catch (error) {
    console.error('Creem checkout error:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}