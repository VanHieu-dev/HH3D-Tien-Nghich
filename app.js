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
      videoPlayerContainer: document.getElementById('videoPlayerContainer'),
      videoInfo: document.getElementById('videoInfo'),
      watchBtn: document.getElementById('watchBtn'),
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
    const {
      searchInput,
      prevBtn,
      nextBtn,
      quickPrevBtn,
      quickNextBtn,
      watchBtn,
    } = this.elements;

    // Search functionality
    searchInput.addEventListener('input', (e) =>
      this.filterEpisodes(e.target.value),
    );

    // Navigation buttons
    prevBtn.addEventListener('click', () => this.navigateEpisode(-1));
    nextBtn.addEventListener('click', () => this.navigateEpisode(1));
    quickPrevBtn.addEventListener('click', () => this.navigateEpisode(-1));
    quickNextBtn.addEventListener('click', () => this.navigateEpisode(1));

    // Watch button for opening video in new tab
    watchBtn.addEventListener('click', () => this.openVideoInNewTab());

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboard(e));

    // Fullscreen events
    document.addEventListener('fullscreenchange', () =>
      this.handleFullscreenChange(),
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
    this.currentVideoUrl = episode.videoUrl;

    // Update episode title
    this.elements.currentEpisode.textContent = episode.title;

    // Check if this is a Facebook video or external video
    if (episode.videoUrl.includes('facebook.com')) {
      this.showVideoInfo(
        'Facebook Video',
        'Video từ Facebook sẽ mở trong tab mới',
      );
    } else {
      // Try to show iframe first, fallback to external link if blocked
      this.tryLoadIframe(episode);
    }

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

  tryLoadIframe(episode) {
    // Hide video info and show iframe
    this.elements.videoInfo.style.display = 'none';
    this.elements.videoPlayer.style.display = 'block';
    this.elements.watchBtn.style.display = 'none';

    // Set iframe source
    this.elements.videoPlayer.src = episode.videoUrl;

    // Set up fallback in case iframe fails to load
    setTimeout(() => {
      this.checkIframeLoad(episode);
    }, 3000);
  }

  checkIframeLoad(episode) {
    // Check if iframe loaded successfully
    try {
      const iframe = this.elements.videoPlayer;
      // If iframe is blocked, it will have no content or throw an error
      if (!iframe.contentDocument && !iframe.contentWindow) {
        this.showVideoInfo(
          'Video bị chặn',
          'Do chính sách bảo mật, video không thể nhúng trực tiếp',
        );
      }
    } catch (e) {
      // Iframe blocked by CSP
      this.showVideoInfo(
        'Video bị chặn',
        'Do chính sách bảo mật, video không thể nhúng trực tiếp',
      );
    }
  }

  showVideoInfo(title, message) {
    // Hide iframe and show video info
    this.elements.videoPlayer.style.display = 'none';
    this.elements.videoInfo.style.display = 'flex';
    this.elements.watchBtn.style.display = 'flex';

    // Update info text
    const h3 = this.elements.videoInfo.querySelector('h3');
    const p = this.elements.videoInfo.querySelector('.video-note');
    if (h3) h3.textContent = title;
    if (p) p.textContent = message;
  }

  openVideoInNewTab() {
    if (this.currentVideoUrl) {
      window.open(this.currentVideoUrl, '_blank');
    }
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
