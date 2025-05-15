import { NextResponse } from 'next/server';
import { getColumns, getTasks, getTeamMembers } from '@/lib/actions';

export async function GET() {
  try {
    const columns = await getColumns();
    const tasks = await getTasks();
    const users = await getTeamMembers();
    
    return NextResponse.json({
      columns,
      tasks,
      users
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json(
      { error: 'Debug error' },
      { status: 500 }
    );
  }
} 