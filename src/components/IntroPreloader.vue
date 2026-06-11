<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import gsap from 'gsap'

const props = defineProps({
  items: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['complete'])

const introRoot = ref(null)
const percent = ref(0)
const stage = ref('loading')
const activeIndex = ref(0)
const galleryLocked = ref(false)

let introContext
let percentTween
let mainTimeline
let completeTimer
let touchStartY = 0

const fallbackItems = [
  {
    id: 'intro-local-hero',
    name: '北京文旅智能推荐助手',
    type: 'Digital Heritage Routes',
    image: new URL('../assets/hero.png', import.meta.url).href
  }
]

const baseItems = computed(() => {
  const normalized = props.items
    .filter((item) => item?.image)
    .map((item, index) => ({
      id: item.id || `intro-${index}`,
      name: item.name || item.title || 'Beijing Heritage',
      type: item.type || item.area || item.date || 'Selected Work',
      image: item.image
    }))

  return (normalized.length ? normalized : fallbackItems).map((item, index) => ({
    ...item,
    key: `${item.id}-${index}`
  }))
})

const galleryItems = computed(() => baseItems.value.slice(0, 8))
const activeGalleryItem = computed(() => galleryItems.value[activeIndex.value] || galleryItems.value[0])
const lastGalleryIndex = computed(() => Math.max(galleryItems.value.length - 1, 0))

const galleryCardStyle = (index) => {
  const offset = index - activeIndex.value
  const distance = Math.abs(offset)
  const scale = Math.max(0.68, 1 - distance * 0.08)
  const opacity = distance > 3 ? 0 : Math.max(0.2, 1 - distance * 0.22)
  const x = offset * 30
  const y = distance ? (index % 2 === 0 ? -3 : 3) : 0

  return {
    opacity,
    zIndex: 20 - distance,
    transform: `translate3d(calc(-50% + ${x}vw), calc(-50% + ${y}vh), 0) scale(${scale})`
  }
}

const preloadImage = (src) => new Promise((resolve) => {
  if (!src) {
    resolve()
    return
  }

  const image = new Image()
  const done = () => resolve()
  const timer = window.setTimeout(done, 2400)

  image.onload = () => {
    window.clearTimeout(timer)
    if (image.decode) {
      image.decode().catch(() => {}).finally(done)
      return
    }
    done()
  }
  image.onerror = () => {
    window.clearTimeout(timer)
    done()
  }
  image.src = src
})

const preloadIntroImages = () => Promise.allSettled(galleryItems.value.map((item) => preloadImage(item.image)))

const finishIntro = () => {
  emit('complete')
}

const wait = (duration) => new Promise((resolve) => {
  window.setTimeout(resolve, duration)
})

const finishGallery = () => {
  if (stage.value === 'done' || !introRoot.value) return

  stage.value = 'done'
  percentTween?.kill()
  mainTimeline?.kill()
  mainTimeline = gsap.to(introRoot.value.querySelector('.intro-shell'), {
    autoAlpha: 0,
    duration: 0.7,
    ease: 'power2.inOut',
    onComplete: finishIntro
  })
}

const scheduleFinishAfterLastImage = () => {
  window.clearTimeout(completeTimer)
  completeTimer = window.setTimeout(finishGallery, 950)
}

const moveGallery = (direction) => {
  if (stage.value !== 'gallery' || galleryLocked.value) return

  galleryLocked.value = true
  window.clearTimeout(completeTimer)

  if (direction > 0) {
    if (activeIndex.value < lastGalleryIndex.value) {
      activeIndex.value += 1
      if (activeIndex.value === lastGalleryIndex.value) {
        scheduleFinishAfterLastImage()
      }
    } else {
      finishGallery()
    }
  } else if (activeIndex.value > 0) {
    activeIndex.value -= 1
  }

  window.setTimeout(() => {
    galleryLocked.value = false
  }, 680)
}

const handleWheel = (event) => {
  if (Math.abs(event.deltaY) < 12) return
  moveGallery(event.deltaY > 0 ? 1 : -1)
}

const handleTouchStart = (event) => {
  touchStartY = event.touches[0]?.clientY || 0
}

const handleTouchEnd = (event) => {
  const touchEndY = event.changedTouches[0]?.clientY || touchStartY
  const delta = touchStartY - touchEndY

  if (Math.abs(delta) < 24) return
  moveGallery(delta > 0 ? 1 : -1)
}

const playIntro = async () => {
  await nextTick()

  if (!introRoot.value) return

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (reduceMotion) {
    percent.value = 100
    stage.value = 'gallery'
    completeTimer = window.setTimeout(finishGallery, 900)
    return
  }

  const root = introRoot.value
  const q = gsap.utils.selector(root)

  introContext = gsap.context(() => {
    gsap.set(q('.loading-percent'), {
      autoAlpha: 1,
      scale: 1
    })
    gsap.set(q('.intro-gallery'), {
      autoAlpha: 0
    })
    gsap.set(q('.intro-gallery-card'), {
      autoAlpha: 0
    })
  }, root)

  percentTween = gsap.to(percent, {
    value: 100,
    duration: 2.45,
    ease: 'power2.inOut',
    snap: { value: 1 }
  })

  await Promise.all([
    preloadIntroImages(),
    wait(2450)
  ])

  if (!introRoot.value) return

  mainTimeline = gsap.timeline({
    defaults: { ease: 'power3.out' },
  })
    .to(q('.loading-percent'), {
      autoAlpha: 0,
      scale: 0.985,
      duration: 0.28,
      ease: 'power2.inOut'
    })
    .call(() => {
      stage.value = 'gallery'
      activeIndex.value = 0
    })
    .set(q('.intro-gallery'), {
      autoAlpha: 1
    })
    .to(q('.intro-gallery-card'), {
      autoAlpha: 1,
      duration: 0.9,
      ease: 'expo.out',
      stagger: {
        each: 0.05,
        from: 'center'
      }
    })
}

onMounted(() => {
  playIntro()
})

onBeforeUnmount(() => {
  introContext?.revert()
  percentTween?.kill()
  mainTimeline?.kill()
  window.clearTimeout(completeTimer)
})
</script>

<template>
  <section
    ref="introRoot"
    class="intro-preloader"
    aria-label="首页进入开场"
    @wheel.prevent="handleWheel"
    @touchstart.passive="handleTouchStart"
    @touchend="handleTouchEnd"
  >
    <div class="intro-shell" :data-stage="stage">
      <div class="loading-percent" aria-live="polite">{{ percent }}%</div>

      <section class="intro-gallery" aria-label="北京文旅图片开场浏览">
        <nav class="intro-gallery-nav" aria-hidden="true">
          <span>Work</span>
          <span>About</span>
        </nav>

        <div class="intro-gallery-copy" aria-live="polite">
          <p>{{ activeGalleryItem.type }}</p>
          <h1>{{ activeGalleryItem.name }}</h1>
        </div>

        <div class="intro-gallery-viewport">
          <figure
            v-for="(item, index) in galleryItems"
            :key="`gallery-${item.key}`"
            class="intro-gallery-card"
            :class="{ active: index === activeIndex }"
            :style="galleryCardStyle(index)"
          >
            <img :src="item.image" :alt="item.name" />
          </figure>
        </div>

        <div class="intro-gallery-footer" aria-hidden="true">
          <span>{{ activeIndex + 1 }}</span>
          <span>—</span>
          <span>{{ galleryItems.length }}</span>
        </div>
      </section>
    </div>
  </section>
</template>

<style scoped>
.intro-preloader,
.intro-shell {
  position: fixed;
  inset: 0;
  z-index: 2147483001;
  overflow: hidden;
  background: #111111;
  color: #f2f2f2;
  font-family: "ZQKNBCGPST", "PingFang SC", "Microsoft YaHei", serif;
}

.intro-shell {
  transform-origin: center;
}

.loading-percent {
  position: fixed;
  inset: 0;
  z-index: 6;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #111111;
  color: rgba(255, 255, 255, 0.78);
  font-family: "Inter", "PingFang SC", system-ui, sans-serif;
  font-size: 10px;
  font-weight: 300;
  letter-spacing: 0;
}

.intro-gallery {
  position: fixed;
  inset: 0;
  z-index: 3;
  overflow: hidden;
  background: #111111;
}

.intro-gallery-nav {
  position: absolute;
  top: clamp(26px, 5vh, 46px);
  left: 50%;
  z-index: 20;
  display: flex;
  gap: clamp(36px, 6vw, 78px);
  color: rgba(255, 255, 255, 0.76);
  font-family: "Inter", "PingFang SC", system-ui, sans-serif;
  font-size: 11px;
  letter-spacing: 0;
  transform: translateX(-50%);
}

.intro-gallery-copy {
  position: absolute;
  top: 52%;
  left: 50%;
  z-index: 16;
  width: min(720px, calc(100% - 44px));
  color: #f1f1f1;
  text-align: center;
  text-shadow: 0 18px 40px rgba(0, 0, 0, 0.38);
  transform: translate(-50%, -50%);
  pointer-events: none;
}

.intro-gallery-copy p {
  margin: 0 0 10px;
  color: rgba(255, 255, 255, 0.68);
  font-family: "Inter", "PingFang SC", system-ui, sans-serif;
  font-size: 11px;
  letter-spacing: 0;
}

.intro-gallery-copy h1 {
  margin: 0;
  font-size: clamp(42px, 7vw, 92px);
  font-weight: 400;
  line-height: 0.96;
  letter-spacing: 0;
}

.intro-gallery-viewport {
  position: absolute;
  inset: 0;
  z-index: 10;
}

.intro-gallery-card {
  position: absolute;
  top: 50%;
  left: 50%;
  width: clamp(220px, 30vw, 420px);
  aspect-ratio: 1.45 / 1;
  margin: 0;
  overflow: hidden;
  background: #171717;
  transition:
    transform 0.88s cubic-bezier(0.19, 1, 0.22, 1),
    opacity 0.72s ease;
  will-change: transform, opacity;
}

.intro-gallery-card.active {
  width: clamp(260px, 34vw, 480px);
}

.intro-gallery-card img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
  transform: scale(1.02);
}

.intro-gallery-footer {
  position: absolute;
  bottom: clamp(28px, 6vh, 54px);
  left: 50%;
  z-index: 20;
  display: grid;
  grid-template-columns: auto auto auto;
  gap: 14px;
  align-items: center;
  color: rgba(255, 255, 255, 0.72);
  font-family: "Inter", "PingFang SC", system-ui, sans-serif;
  font-size: 11px;
  letter-spacing: 0;
  transform: translateX(-50%);
}

@media (max-width: 768px) {
  .intro-gallery-nav {
    top: 24px;
    gap: 34px;
  }

  .intro-gallery-copy {
    top: 52%;
  }

  .intro-gallery-copy h1 {
    font-size: clamp(34px, 12vw, 58px);
  }

  .intro-gallery-card,
  .intro-gallery-card.active {
    width: min(72vw, 360px);
    aspect-ratio: 1 / 1.18;
  }
}
</style>
