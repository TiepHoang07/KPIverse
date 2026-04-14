import { Target, Users, User, UsersRound } from "lucide-react";

export const navigationCards = [
  {
    title: "KPIs",
    description: "Track your personal goals",
    icon: Target,
    color: "blue",
    stats: null,
    statLabel: "Active KPIs",
    path: "/kpis",
    gradient: "from-orange-100 to-orange-600"
  },
  {
    title: "Groups",
    description: "Collaborate with teams",
    icon: Users,
    color: "purple",
    stats: null,
    statLabel: "Groups joined",
    path: "/groups",
    gradient: "from-orange-100 to-orange-600"
  },
  {
    title: "Friends",
    description: "Connect with others",
    icon: UsersRound,
    color: "green",
    stats: null,
    statLabel: "Friends",
    path: "/friends",
    gradient: "from-orange-100 to-orange-600"
  },
  {
    title: "Profile",
    description: "View your profile",
    icon: User,
    color: "orange",
    stats: null,
    statLabel: "",
    path: "/profile",
    gradient: "from-orange-100 to-orange-600"
  }
];

export type NavigationCard = typeof navigationCards[0];