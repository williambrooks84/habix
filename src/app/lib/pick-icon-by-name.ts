import {
    HealthIcon,
    LearningIcon,
    ProductivityIcon,
    ActivityIcon,
} from '@/components/ui/icons';

export function pickIconByName(name: string) {
    const n = name.toLowerCase();
    if (n.includes('sant') || n.includes('health') || n.includes('santé')) return HealthIcon;
    if (n.includes('learn') || n.includes('study') || n.includes('appr')) return LearningIcon;
    if (n.includes('prod') || n.includes('work') || n.includes('task') || n.includes('tâche') || n.includes('travail')) return ProductivityIcon;
    if (n.includes('sport') || n.includes('activité') || n.includes('move') || n.includes('activity')) return ActivityIcon;
    return ActivityIcon;
}