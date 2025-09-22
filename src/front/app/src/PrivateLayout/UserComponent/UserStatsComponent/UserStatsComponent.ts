import AmethComponent from "../../../framework/AmethComponent";
import UserProfileService from "../services/UserProfileService";
import type { UserStats } from "./models/UserStats";
import { PieChart, type AnimationDefinition, easings } from 'chartist';
import 'chartist/dist/index.css';

export default class UserStatsComponent extends AmethComponent {
  template = () => import("./UserStatsComponent.html?raw");
  protected userProfileService: UserProfileService;
  protected targetUser: string;

  constructor(targetUser: string) {
    super();
    this.userProfileService = new UserProfileService();
    this.targetUser = targetUser;
  }

  private animateCounter(
    el: HTMLElement,
    to: number,
    duration: number = 1500,
    decimals: number = 0
  ) {
    const start = 0;
    const startTime = performance.now();

    function easeOutCube(t: number): number {
      return 1 - Math.pow(1 - t, 5);  
    }
  
    function update(currentTime: number) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCube(progress);
      const current = start + (to - start) * eased;
  
      el.innerText = current.toFixed(decimals);
  
      if (progress < 1) {
        requestAnimationFrame(update);
      }
    }
    requestAnimationFrame(update);
  }

  async afterInit() {
    const stats = await this.userProfileService.getUserStats(this.targetUser) as UserStats;
    const winRate = Math.round((stats.matchesWon / stats.totalMatches) * 100);
    const losses = stats.totalMatches - stats.matchesWon;
    // const testTournamentAvg = 3.2;
    // const testTournamentAmount = 50;
    document.getElementById("userIdw")!.innerHTML = winRate.toString() + "%";
    (document.querySelector('#donut-center-text span') as HTMLElement).innerText = stats.totalMatches.toString();
    const centerText = document.getElementById('donut-center-text');
    const span = document.querySelector('#donut-center-text span') as HTMLElement;
    if (centerText && span) {
      centerText.classList.remove('hidden');
      setTimeout(() => {
        centerText.classList.add('opacity-100');
        this.animateCounter(span, stats.totalMatches, 2500);
      }, 0);
    }
    const chart = new PieChart('#matchChart', {
        series: [{
          value: stats.matchesWon,
          name: "wins",
          className: "stroke-green-400",
        }, {
          value: losses,
          name: "losses",
          className: "stroke-red-400",
        }],
        labels: [winRate + '%', 100 - winRate + '%']
      },
      {
        donut: true,
        showLabel: true
      }
    );
    
    chart.on('draw', data => {
      document.querySelectorAll('.ct-label').forEach(label => {
        (label as SVGElement).classList.add('opacity-0', 'transition-opacity', 'duration-700');
        setTimeout(() => (label as SVGElement).classList.add('opacity-100'), 1500);
      });
      if (data.type === 'slice') {
        // Get the total path length in order to use for dash array animation
        const pathLength = data.element
          .getNode<SVGGeometryElement>()
          .getTotalLength();
    
        // Set a dasharray that matches the path length as prerequisite to animate dashoffset
        data.element.attr({
          'stroke-dasharray': pathLength + 'px ' + pathLength + 'px'
        });
    
        // Create animation definition while also assigning an ID to the animation for later sync usage
        const animationDefinition: Record<string, AnimationDefinition> = {
          'stroke-dashoffset': {
            id: 'anim' + data.index,
            dur: 1000,
            from: -pathLength + 'px',
            to: '0px',
            easing: easings.easeOutQuint,
            // We need to use `fill: 'freeze'` otherwise our animation will fall back to initial (not visible)
            fill: 'freeze'
          }
        };
    
        // If this was not the first slice, we need to time the animation so that it uses the end sync event of the previous animation
        if (data.index !== 0) {
          animationDefinition['stroke-dashoffset'].begin =
            'anim' + (data.index - 1) + '.end';
        }
    
        // We need to set an initial value before the animation starts as we are not in guided mode which would do that for us
        data.element.attr({
          'stroke-dashoffset': -pathLength + 'px'
        });
    
        // We can't use guided mode as the animations need to rely on setting begin manually
        data.element.animate(animationDefinition, false);
      }
    });

  }

  refresh() {
    this.afterInit();
  }
}
