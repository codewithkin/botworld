import { prisma } from '@/lib/auth';
import { sendNotificationEmail } from '@/lib/email/email';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { plan, userId } = await request.json();

    // Validate input
    if (!plan || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate plan exists in our offerings
    const validPlans = ['free', 'lite', 'business', 'unlimited'];
    if (!validPlans.includes(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan specified' },
        { status: 400 }
      );
    }

    // Update user's plan in database
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { plan },
      select: {
        email: true,
        name: true,
        plan: true
      }
    });

    // Send confirmation email
    const emailResult = await sendNotificationEmail({
      to: updatedUser.email,
      content: {
        subject: `Your BotWorld Plan Has Been Upgraded!`,
        html: `
          <h1>Plan Upgrade Confirmation</h1>
          <p>Hello ${updatedUser.name || 'there'},</p>
          <p>Your BotWorld account has been successfully upgraded to the <strong>${plan}</strong> plan.</p>
          <p>You now have access to all the features included in this plan.</p>
          <p>If you have any questions, please contact our support team.</p>
          <p>Happy building!</p>
          <p>The BotWorld Team</p>
        `,
        text: `
          Plan Upgrade Confirmation\n\n
          Hello ${updatedUser.name || 'there'},\n\n
          Your BotWorld account has been successfully upgraded to the ${plan} plan.\n\n
          You now have access to all the features included in this plan.\n\n
          If you have any questions, please contact our support team.\n\n
          Happy building!\n\n
          The BotWorld Team
        `
      }
    });

    if (emailResult.error) {
      console.error('Failed to send confirmation email:', emailResult.error);
      // We'll still return success since the plan was updated
      // but log the email failure
    }

    return NextResponse.json(
      { 
        success: true, 
        message: 'Plan upgraded successfully',
        data: {
          newPlan: updatedUser.plan,
          emailSent: !emailResult.error
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Upgrade error:', error);
    
    // Handle Prisma errors specifically
    if (error instanceof Error && error.message.includes('RecordNotFound')) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : undefined
      },
      { status: 500 }
    );
  }
}