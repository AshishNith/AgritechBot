export interface Member {
  id: number;
  slug: string;
  name: string;
  role: string;
  description: string;
  image: string;
  color: string;
  bio: string;
}

export const members: Member[] = [
  {
    id: 3,
    slug: 'prashant-jain',
    name: 'Prashant Jain',
    role: 'Growth & Partnerships',
    description: 'Building strategic relationships and unlocking sustainable growth.',
    image:
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSSqukdVKCe_ul3tAGkof99_lHpsj31ESc0Ag&s',
    color: '#4D6453',
    bio: 'Prashant Jain focuses on partnerships and growth opportunities, connecting product vision with real-world collaboration to expand impact and value.',
  },
  {
    id: 1,
    slug: 'prakash-chand-jain',
    name: 'Prakash Chand Jain',
    role: 'Strategic Advisor',
    description: 'Guiding long-term vision with deep business and community insight.',
    image:
      'https://images.unsplash.com/photo-1552058544-f2b08422138a?q=80&w=1974&auto=format&fit=crop',
    color: '#2D5A27',
    bio: 'Prakash Chand Jain brings decades of leadership perspective to the team, helping shape strategy, execution priorities, and long-term growth in a practical, people-first way.',
  },
  {
    id: 2,
    slug: 'prateek-jain',
    name: 'Prateek Jain',
    role: 'Operations Lead',
    description: 'Driving operational excellence and reliable delivery across initiatives.',
    image:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=1974&auto=format&fit=crop',
    color: '#C0D72F',
    bio: 'Prateek Jain leads operations with a strong focus on process clarity, coordination, and measurable outcomes to keep projects moving smoothly from planning to delivery.',
  },
  
];
