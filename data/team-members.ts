export interface TeamMember {
  id: string
  name: string
  role: string
  avatar: string
}

export const teamMembers: TeamMember[] = [
  {
    id: 'user1',
    name: 'Alex Johnson',
    role: 'Frontend Developer',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    id: 'user2',
    name: 'Taylor Smith',
    role: 'UI/UX Designer',
    avatar: 'https://randomuser.me/api/portraits/women/44.jpg'
  },
  {
    id: 'user3',
    name: 'Jordan Lee',
    role: 'Backend Developer',
    avatar: 'https://randomuser.me/api/portraits/men/46.jpg'
  },
  {
    id: 'user4',
    name: 'Morgan Chen',
    role: 'Product Manager',
    avatar: 'https://randomuser.me/api/portraits/women/33.jpg'
  },
  {
    id: 'user5',
    name: 'Riley Brown',
    role: 'DevOps Engineer',
    avatar: 'https://randomuser.me/api/portraits/men/97.jpg'
  },
  {
    id: 'user6',
    name: 'Jamie Garcia',
    role: 'QA Engineer',
    avatar: 'https://randomuser.me/api/portraits/women/68.jpg'
  },
  {
    id: 'user7',
    name: 'Casey Wilson',
    role: 'Data Scientist',
    avatar: 'https://randomuser.me/api/portraits/men/2.jpg'
  },
  {
    id: 'user8',
    name: 'Quinn Murphy',
    role: 'Technical Writer',
    avatar: 'https://randomuser.me/api/portraits/women/90.jpg'
  }
] 