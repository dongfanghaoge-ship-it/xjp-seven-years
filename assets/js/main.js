/* ============================================================
   红心阅动，信仰有声 — H5 交互逻辑
   纯原生 JavaScript，无框架依赖
   ============================================================ */

document.addEventListener('DOMContentLoaded', function () {

  /* ==========================================================
     1. 封面「开始阅读」按钮 — 平滑滚动至时间线
     ========================================================== */
  var startBtn = document.getElementById('startBtn');
  var timelineSection = document.getElementById('timeline');

  if (startBtn && timelineSection) {
    startBtn.addEventListener('click', function () {
      timelineSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // 平滑滚动完成后自动开始滚动
      setTimeout(function () {
        startAutoScroll();
      }, 600);
    });
  }

  /* ==========================================================
     2. Intersection Observer — 卡片淡入 + 打字机触发
     ========================================================== */
  var observer = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          // 卡片淡入
          entry.target.classList.add('visible');

          // 金句打字机效果 — 目标为 .card-quote-text 内部的 span
          var quoteText = entry.target.querySelector('.card-quote-text');
          if (quoteText && !quoteText.dataset.typed) {
            typeWriter(quoteText);
            quoteText.dataset.typed = 'true';
          }
        }
      });
    },
    { threshold: 0.2 }
  );

  // 观察所有 .fade-in 卡片
  var fadeEls = document.querySelectorAll('.fade-in');
  for (var f = 0; f < fadeEls.length; f++) {
    observer.observe(fadeEls[f]);
  }

  /* ==========================================================
     3. 时间线进度条 + 当前卡片高亮
     ========================================================== */
  var timelineLine = document.querySelector('.timeline-line');
  var allCards = document.querySelectorAll('.card');

  function updateTimelineProgress() {
    // 时间轴线进度
    if (timelineLine && timelineSection) {
      var rect = timelineSection.getBoundingClientRect();
      var total = rect.height - window.innerHeight;
      if (total > 0) {
        var progress = Math.max(0, Math.min(100, (-rect.top / total) * 100));
        timelineLine.style.setProperty('--progress', progress + '%');
      }
    }

    // 高亮当前可见卡片
    for (var c = 0; c < allCards.length; c++) {
      var card = allCards[c];
      var cr = card.getBoundingClientRect();
      // 卡片顶部超过视口一半、底部还在视口内时视为活跃
      if (cr.top < window.innerHeight * 0.5 && cr.bottom > window.innerHeight * 0.3) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    }
  }

  window.addEventListener('scroll', updateTimelineProgress, { passive: true });
  // 初始执行一次
  updateTimelineProgress();

  /* ==========================================================
     4. 打字机效果函数
     ========================================================== */
  function typeWriter(element) {
    var fullText = element.textContent.trim();
    if (!fullText) return;

    element.textContent = '';
    element.classList.add('typewriter');

    var i = 0;
    var timer = setInterval(function () {
      if (i < fullText.length) {
        element.textContent += fullText.charAt(i);
        i++;
      } else {
        clearInterval(timer);
        element.classList.remove('typewriter');
      }
    }, 60);
  }

  /* ==========================================================
     5. 底部时间轴快速跳转
     ========================================================== */
  var navDots = document.querySelectorAll('.nav-dot');

  // 点击导航点跳转到对应卡片
  for (var d = 0; d < navDots.length; d++) {
    navDots[d].addEventListener('click', function () {
      var targetYear = this.dataset.target;
      var targetCard = document.querySelector('.card[data-year="' + targetYear + '"]');
      if (targetCard) {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  }

  // 滚动时更新导航高亮
  function updateNavHighlight() {
    var currentYear = null;
    for (var c2 = 0; c2 < allCards.length; c2++) {
      var card = allCards[c2];
      var rect = card.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.5) {
        currentYear = card.dataset.year;
      }
    }
    for (var d2 = 0; d2 < navDots.length; d2++) {
      var dot = navDots[d2];
      if (dot.dataset.target === currentYear) {
        dot.classList.add('active');
      } else {
        dot.classList.remove('active');
      }
    }
  }

  window.addEventListener('scroll', updateNavHighlight, { passive: true });
  updateNavHighlight();

  /* ==========================================================
     6. 音频控制
     ========================================================== */
  var bgm = document.getElementById('bgm');
  var audioBtn = document.getElementById('audio-control');
  var audioIcon = audioBtn ? audioBtn.querySelector('.audio-icon') : null;
  var audioStarted = false;

  // 用户首次任意交互时尝试播放音频
  function tryPlayAudio() {
    if (!audioStarted && bgm) {
      bgm.play().then(function () {
        audioStarted = true;
        if (audioBtn) {
          audioBtn.classList.remove('muted');
          audioBtn.classList.add('playing');
        }
        if (audioIcon) {
          audioIcon.textContent = '🎵'; // 🎵
        }
      }).catch(function () {
        // 浏览器自动播放策略可能阻止，静默失败，用户可手动点击
      });
    }
  }

  // 监听全局首次点击尝试播放
  document.addEventListener('click', tryPlayAudio, { once: false });

  // 音频按钮手动切换
  if (audioBtn) {
    audioBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (!bgm) return;

      if (bgm.paused) {
        bgm.play().then(function () {
          audioStarted = true;
          audioBtn.classList.add('playing');
          audioBtn.classList.remove('muted');
          if (audioIcon) audioIcon.textContent = '🎵';
        }).catch(function () {});
      } else {
        bgm.pause();
        audioBtn.classList.remove('playing');
        audioBtn.classList.add('muted');
        if (audioIcon) audioIcon.textContent = '🔇';
      }
    });
  }

  /* ==========================================================
     7. 红星粒子飘落
     ========================================================== */
  var starsContainer = document.getElementById('stars-container');
  var starSymbols = ['★', '✦', '✧', '⭑'];

  function createStar() {
    var star = document.createElement('span');
    star.className = 'star-particle';
    star.textContent = starSymbols[Math.floor(Math.random() * starSymbols.length)];
    star.style.left = Math.random() * 100 + '%';
    star.style.fontSize = (10 + Math.random() * 16) + 'px';
    star.style.animationDuration = (12 + Math.random() * 18) + 's';
    star.style.animationDelay = Math.random() * 15 + 's';
    starsContainer.appendChild(star);

    star.addEventListener('animationend', function () {
      star.remove();
    });
  }

  // 初始散布星星
  for (var s = 0; s < 12; s++) {
    setTimeout(function () { createStar(); }, Math.random() * 8000);
  }

  // 持续生成
  setInterval(createStar, 2500);

  /* ==========================================================
     8. 照片点击灯箱
     ========================================================== */
  var lightbox = document.getElementById('lightbox');
  var lightboxImg = document.getElementById('lightbox-img');
  var lightboxClose = lightbox.querySelector('.lightbox-close');

  function openLightbox(imgEl) {
    lightboxImg.src = imgEl.src;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    lightboxImg.src = '';
  }

  // 点击卡片图片
  var cardImages = document.querySelectorAll('.card-image img');
  for (var ci = 0; ci < cardImages.length; ci++) {
    cardImages[ci].addEventListener('click', function (e) {
      e.stopPropagation();
      openLightbox(this);
    });
    cardImages[ci].style.cursor = 'pointer';
  }

  // 关闭灯箱
  lightbox.addEventListener('click', function (e) {
    if (e.target === lightbox || e.target === lightboxClose) {
      closeLightbox();
    }
  });

  // ESC 关闭
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) {
      closeLightbox();
    }
  });

  /* ==========================================================
     9. 年份过渡光点
     ========================================================== */
  var transitionDot = document.createElement('div');
  transitionDot.className = 'year-transition-dot';
  timelineSection.appendChild(transitionDot);

  var prevYear = null;

  function updateYearTransition() {
    var currentYear = null;
    for (var c3 = 0; c3 < allCards.length; c3++) {
      var card = allCards[c3];
      var rect = card.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.55) {
        currentYear = card.dataset.year;
      }
    }

    if (currentYear && currentYear !== prevYear) {
      prevYear = currentYear;
      var activeCard = document.querySelector('.card[data-year="' + currentYear + '"]');
      if (activeCard) {
        var cardTop = activeCard.getBoundingClientRect().top;
        var timelineTop = timelineSection.getBoundingClientRect().top;
        var relativeTop = cardTop - timelineTop + activeCard.offsetHeight * 0.1;
        transitionDot.style.top = relativeTop + 'px';
      }
    }
  }

  window.addEventListener('scroll', updateYearTransition, { passive: true });
  updateYearTransition();

  /* ==========================================================
     10. 回到顶部按钮
     ========================================================== */
  var backToTop = document.getElementById('backToTop');
  var coverSection = document.getElementById('cover');

  function updateBackToTop() {
    if (window.scrollY > window.innerHeight * 0.6) {
      backToTop.classList.add('visible');
    } else {
      backToTop.classList.remove('visible');
    }
  }

  backToTop.addEventListener('click', function () {
    coverSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  window.addEventListener('scroll', updateBackToTop, { passive: true });
  updateBackToTop();

  /* ==========================================================
     11. 视频播放时暂停背景音乐
     ========================================================== */
  var videoOverlay = document.getElementById('videoOverlay');
  if (videoOverlay && bgm) {
    videoOverlay.addEventListener('click', function () {
      // Pause BGM
      if (!bgm.paused) {
        bgm.pause();
        audioStarted = false;
        if (audioBtn) {
          audioBtn.classList.remove('playing');
          audioBtn.classList.add('muted');
        }
        if (audioIcon) audioIcon.textContent = '🔇';
      }
      // Hide overlay so user can interact with iframe
      videoOverlay.classList.add('hidden');
    });
  }

  /* ==========================================================
     12. 自动滚动开关
     ========================================================== */
  var autoScrollToggle = document.getElementById('autoScrollToggle');
  var autoScrollActive = false;
  var autoScrollTimer = null;
  var scrollSpeed = 1.5; // px per tick

  function autoScrollStep() {
    if (!autoScrollActive) return;

    var maxTop = document.documentElement.scrollHeight - window.innerHeight;
    var newTop = window.scrollY + scrollSpeed;

    if (newTop >= maxTop - 10) {
      window.scrollTo({ top: maxTop, behavior: 'auto' });
      stopAutoScroll();
      return;
    }

    window.scrollTo({ top: newTop, behavior: 'auto' });
    autoScrollTimer = setTimeout(autoScrollStep, 20);
  }

  function startAutoScroll() {
    // If still on cover, jump past it
    if (window.scrollY < window.innerHeight * 0.5) {
      window.scrollTo({ top: window.innerHeight, behavior: 'auto' });
    }

    autoScrollActive = true;
    autoScrollToggle.classList.add('active');
    autoScrollToggle.textContent = '暂停滚动';
    autoScrollTimer = setTimeout(autoScrollStep, 20);
  }

  function stopAutoScroll() {
    autoScrollActive = false;
    if (autoScrollTimer) {
      clearTimeout(autoScrollTimer);
      autoScrollTimer = null;
    }
    autoScrollToggle.classList.remove('active');
    autoScrollToggle.textContent = '自动滚动';
  }

  if (autoScrollToggle) {
    autoScrollToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      if (autoScrollActive) {
        stopAutoScroll();
      } else {
        startAutoScroll();
      }
    });

    // Stop auto-scroll on any user interaction
    window.addEventListener('wheel', function () {
      if (autoScrollActive) stopAutoScroll();
    }, { passive: true });

    window.addEventListener('touchmove', function () {
      if (autoScrollActive) stopAutoScroll();
    }, { passive: true });
  }

});
