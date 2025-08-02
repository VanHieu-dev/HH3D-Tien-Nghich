/**
 * Tiên Nghịch Movie Player - Optimized
 */
class MoviePlayer {
  constructor() {
    this.episodes = window.LinksTienNghich || [];
    this.currentEpisodeIndex = -1;
    this.filteredEpisodes = [...this.episodes];

    this.init();
    console.log(`🎬 Loaded ${this.episodes.length} episodes`);
  }

  init() {
    this.initElements();
    this.setupEventListeners();
    this.renderEpisodes();
    this.updateEpisodeCount();
  }

  initElements() {
    // Cache all DOM elements
    this.elements = {
      episodesGrid: document.getElementById('episodesGrid'),
      searchInput: document.getElementById('searchInput'),
      videoSection: document.getElementById('videoSection'),
      videoPlayer: document.getElementById('videoPlayer'),
      currentEpisode: document.getElementById('currentEpisode'),
      prevBtn: document.getElementById('prevBtn'),
      nextBtn: document.getElementById('nextBtn'),
      quickPrevBtn: document.getElementById('quickPrevBtn'),
      quickNextBtn: document.getElementById('quickNextBtn'),
      episodeNavControls: document.getElementById('episodeNavControls'),
      fullscreenHelp: document.getElementById('fullscreenHelp'),
      loading: document.getElementById('loading'),
      episodeCount: document.getElementById('episodeCount'),
    };

    // Show video section
    this.elements.videoSection.style.display = 'block';
  }

  setupEventListeners() {
    const { searchInput, prevBtn, nextBtn, quickPrevBtn, quickNextBtn } =
      this.elements;

    // Search functionality
    searchInput.addEventListener('input', (e) =>
      this.filterEpisodes(e.target.value),
    );

    // Navigation buttons - unified handler
    [prevBtn, quickPrevBtn].forEach((btn) =>
      btn.addEventListener('click', () => this.navigateEpisode(-1)),
    );
    [nextBtn, quickNextBtn].forEach((btn) =>
      btn.addEventListener('click', () => this.navigateEpisode(1)),
    );

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;

      switch (e.key) {
        case 'ArrowLeft':
          e.preventDefault();
          this.navigateEpisode(-1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.navigateEpisode(1);
          break;
        case 'Escape':
          if (document.fullscreenElement) {
            document.exitFullscreen();
          }
          break;
      }
    });

    // Fullscreen detection
    [
      'fullscreenchange',
      'webkitfullscreenchange',
      'mozfullscreenchange',
      'MSFullscreenChange',
    ].forEach((event) =>
      document.addEventListener(event, () => this.handleFullscreenChange()),
    );
  }

  renderEpisodes() {
    const { episodesGrid } = this.elements;

    episodesGrid.innerHTML = this.filteredEpisodes
      .map((episode, index) => this.createEpisodeCard(episode, index))
      .join('');
  }

  createEpisodeCard(episode, index) {
    const episodeNumber = this.extractEpisodeNumber(episode.title);
    return `
      <div class="episode-card" data-index="${index}" onclick="moviePlayer.playEpisode(${index})">
        <div class="episode-number">${episodeNumber}</div>
      </div>
    `;
  }

  extractEpisodeNumber(title) {
    const match = title.match(/Tập\s+(\d+(?:-\d+)?)/i);
    return match ? match[1] : '?';
  }

  filterEpisodes(searchTerm) {
    const term = searchTerm.toLowerCase().trim();

    this.filteredEpisodes =
      term === ''
        ? [...this.episodes]
        : this.episodes.filter(
            (episode) =>
              episode.title.toLowerCase().includes(term) ||
              this.extractEpisodeNumber(episode.title).includes(term),
          );

    this.renderEpisodes();
    this.updateEpisodeCount();
    this.updateActiveState();
  }

  playEpisode(index) {
    const episode = this.filteredEpisodes[index];
    if (!episode) return;

    this.currentEpisodeIndex = index;

    // Update video
    this.elements.videoPlayer.src = episode.videoUrl;
    this.elements.currentEpisode.textContent = episode.title;

    // Update UI
    this.updateActiveState();
    this.updateNavigationButtons();
    this.showEpisodeControls();

    // Smooth scroll to video
    this.elements.videoSection.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });

    console.log(`▶️ Playing: ${episode.title}`);
  }

  navigateEpisode(direction) {
    const newIndex = this.currentEpisodeIndex + direction;
    if (newIndex >= 0 && newIndex < this.filteredEpisodes.length) {
      this.playEpisode(newIndex);
    }
  }

  updateActiveState() {
    // Remove all active states
    document.querySelectorAll('.episode-card').forEach((card) => {
      card.classList.remove('active');
    });

    // Add active state to current episode
    if (this.currentEpisodeIndex >= 0) {
      const activeCard = document.querySelector(
        `[data-index="${this.currentEpisodeIndex}"]`,
      );
      activeCard?.classList.add('active');
    }
  }

  updateNavigationButtons() {
    const { prevBtn, nextBtn, quickPrevBtn, quickNextBtn } = this.elements;
    const isFirst = this.currentEpisodeIndex <= 0;
    const isLast = this.currentEpisodeIndex >= this.filteredEpisodes.length - 1;

    prevBtn.disabled = quickPrevBtn.disabled = isFirst;
    nextBtn.disabled = quickNextBtn.disabled = isLast;
  }

  showEpisodeControls() {
    this.elements.episodeNavControls.style.display = 'flex';
  }

  updateEpisodeCount() {
    const total = this.filteredEpisodes.length;
    this.elements.episodeCount.textContent = `${total} tập`;
  }

  handleFullscreenChange() {
    const isFullscreen = !!(
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement
    );

    if (isFullscreen) {
      this.showFullscreenHelp();
    } else {
      this.hideFullscreenHelp();
    }
  }

  showFullscreenHelp() {
    this.elements.fullscreenHelp.classList.add('show');

    // Auto hide after 4 seconds
    clearTimeout(this.helpTimeout);
    this.helpTimeout = setTimeout(() => {
      this.hideFullscreenHelp();
    }, 4000);
  }

  hideFullscreenHelp() {
    this.elements.fullscreenHelp.classList.remove('show');
    clearTimeout(this.helpTimeout);
  }

  // Utility methods
  showLoading() {
    this.elements.loading.classList.add('show');
  }

  hideLoading() {
    this.elements.loading.classList.remove('show');
  }

  getVideoInfo() {
    if (this.currentEpisodeIndex >= 0) {
      return {
        episode: this.filteredEpisodes[this.currentEpisodeIndex],
        index: this.currentEpisodeIndex,
        total: this.filteredEpisodes.length,
      };
    }
    return null;
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.moviePlayer = new MoviePlayer();

  console.log('🎮 Keyboard shortcuts:');
  console.log('  ← → : Previous/Next episode');
  console.log('  ESC : Exit fullscreen');
});
