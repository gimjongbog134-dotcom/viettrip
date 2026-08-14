
document.addEventListener('DOMContentLoaded', () => {
  // Footer year
  document.querySelectorAll('[data-year]').forEach(el => {
    el.textContent = new Date().getFullYear();
  });

  // Active navigation
  const current = (location.pathname.split('/').pop() || 'index.html').toLowerCase();
  document.querySelectorAll('.links a').forEach(link => {
    const href = (link.getAttribute('href') || '').split('#')[0].toLowerCase();
    if (href === current || (current === '' && href === 'index.html')) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

  // Mobile navigation
  const menu = document.querySelector('.menu');
  const nav = document.querySelector('.links');

  if (menu && nav) {
    menu.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menu.setAttribute('aria-expanded', String(open));
      menu.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
      menu.textContent = open ? '✕' : '☰';
    });

    nav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        menu.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-label', '메뉴 열기');
        menu.textContent = '☰';
      });
    });

    document.addEventListener('click', e => {
      if (!nav.contains(e.target) && !menu.contains(e.target)) {
        nav.classList.remove('open');
        menu.setAttribute('aria-expanded', 'false');
        menu.setAttribute('aria-label', '메뉴 열기');
        menu.textContent = '☰';
      }
    });
  }

  // Prevent broken-image icons if an external image ever disappears.
  document.querySelectorAll('img').forEach(img => {
    img.addEventListener('error', () => {
      if (img.dataset.fallbackApplied) return;
      img.dataset.fallbackApplied = 'true';
      const label = img.alt || 'VN VietTrip';
      const svg = `
        <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="700" viewBox="0 0 1200 700">
          <defs>
            <linearGradient id="g" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0" stop-color="#10243f"/>
              <stop offset="1" stop-color="#e94b55"/>
            </linearGradient>
          </defs>
          <rect width="1200" height="700" fill="url(#g)"/>
          <circle cx="980" cy="130" r="95" fill="rgba(255,255,255,.14)"/>
          <circle cx="180" cy="600" r="180" fill="rgba(255,255,255,.08)"/>
          <text x="70" y="560" font-family="Arial, sans-serif" font-size="56" font-weight="700" fill="#fff">${label}</text>
          <text x="70" y="620" font-family="Arial, sans-serif" font-size="26" fill="#f5f7fa">VN VietTrip</text>
        </svg>`;
      img.src = 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(svg);
    }, { once:true });
  });

  // Demo contact form
  const form = document.querySelector('#contactForm');
  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const result = document.querySelector('#result');
      if (result) result.textContent = '문의가 접수되었습니다. 현재는 데모 폼입니다.';
      form.reset();
    });
  }
  // City / attraction search and region filters
  const setupFilters = ({searchId, cardSelector, countId, buttonsSelector}) => {
    const input = document.getElementById(searchId);
    const cards = [...document.querySelectorAll(cardSelector)];
    const count = document.getElementById(countId);
    const buttons = [...document.querySelectorAll(buttonsSelector)];
    if (!input || !cards.length) return;
    let region = 'all';
    const render = () => {
      const q = input.value.trim().toLowerCase();
      let visible = 0;
      cards.forEach(card => {
        const text = (card.dataset.search || card.textContent || '').toLowerCase();
        const matchText = !q || text.includes(q);
        const matchRegion = region === 'all' || card.dataset.region === region;
        const show = matchText && matchRegion;
        card.classList.toggle('is-hidden', !show);
        if (show) visible++;
      });
      if (count) count.textContent = `${visible}개 ${searchId === 'citySearch' ? '도시' : '관광지'}`;
    };
    input.addEventListener('input', render);
    buttons.forEach(btn => btn.addEventListener('click', () => {
      region = btn.dataset.cityRegion || btn.dataset.attractionRegion || 'all';
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      render();
    }));
    render();
  };
  setupFilters({searchId:'citySearch', cardSelector:'.city-card', countId:'cityCount', buttonsSelector:'[data-city-region]'});
  setupFilters({searchId:'attractionSearch', cardSelector:'.attraction-card', countId:'attractionCount', buttonsSelector:'[data-attraction-region]'});

  // Simple local itinerary planner. No server required; selections are saved in the browser.
  const planner = document.getElementById('tripPlanner');
  if (planner) {
    const city = document.getElementById('planCity');
    const days = document.getElementById('planDays');
    const style = document.getElementById('planStyle');
    const result = document.getElementById('planResult');
    const make = document.getElementById('makePlan');
    const reset = document.getElementById('resetPlan');
    const plans = {
      danang: {
        balance:['미케비치 · 한시장','바나힐 · 골든브릿지','호이안 올드타운 · 야경','손짜반도 · 카페','여유로운 해변 + 귀국 준비'],
        food:['한시장 · 반미 맛집','로컬 쌀국수 · 카페 투어','호이안 맛집 · 야시장','해산물 맛집 · 디저트','브런치 · 기념품 쇼핑'],
        nature:['미케비치 일출','바나힐 · 자연 풍경','호이안 근교 · 강변 산책','손짜반도 · 전망대','해변 휴식 · 귀국 준비'],
        culture:['한시장 · 다낭 박물관','바나힐 · 골든브릿지','호이안 올드타운 · 문화유산','용다리 · 참조각박물관','카페 · 자유시간']
      },
      hanoi:{
        balance:['호안끼엠 · 구시가지','문묘 · 서호','하롱베이 당일투어','카페 · 쇼핑','귀국 준비'],
        food:['구시가지 분짜','에그커피 · 로컬 맛집','하노이 길거리 음식','서호 카페 투어','마지막 맛집'],
        nature:['호안끼엠 산책','서호 · 공원','근교 자연 투어','호수 주변 카페','여유로운 아침'],
        culture:['호안끼엠 · 응옥썬 사당','문묘 · 박물관','구시가지 역사 산책','전통시장 · 공연','자유시간']
      },
      hochiminh:{
        balance:['벤탄시장 · 시내','중앙우체국 · 노트르담 주변','쿠치터널 투어','카페 · 쇼핑','귀국 준비'],
        food:['반미 · 쌀국수','카페 아파트 · 디저트','현지 맛집 투어','야시장 · 해산물','브런치'],
        nature:['사이공강 산책','공원 · 카페','근교 메콩 투어','도심 휴식','여유로운 아침'],
        culture:['전쟁박물관 · 중앙우체국','통일궁 · 시내 산책','쿠치터널','차이나타운','자유시간']
      },
      sapa:{
        balance:['사파 시내 · 시장','판시판 · 케이블카','계단식 논 트레킹','마을 산책','귀환 준비'],
        food:['사파 시장','현지식 맛집','산악 마을 음식','카페 · 로컬 디저트','브런치'],
        nature:['사파 계곡 산책','판시판','계단식 논 트레킹','마을 자연 풍경','휴식'],
        culture:['사파 시장 · 소수민족 문화','판시판','마을 문화 체험','전통시장','자유시간']
      },
      nhatrang:{
        balance:['해변 · 시내','섬 투어','포나가르 사원','마사지 · 카페','귀국 준비'],
        food:['해산물 맛집','로컬 쌀국수','야시장','카페 · 디저트','브런치'],
        nature:['나트랑 해변','섬 투어','스노클링','해변 휴식','여유로운 아침'],
        culture:['포나가르 사원','롱선사','현지 시장','시내 산책','자유시간']
      },
      phuquoc:{
        balance:['리조트 · 해변','섬 투어','선셋 · 야시장','스파 · 휴식','귀국 준비'],
        food:['해산물 맛집','로컬 시장','야시장 먹거리','카페 · 디저트','브런치'],
        nature:['해변 휴식','스노클링','섬 투어','선셋 비치','자연 산책'],
        culture:['즈엉동 시장','어촌 마을','사원 · 전통시장','야시장','자유시간']
      }
    };
    const cityNames={danang:'다낭 + 호이안',hanoi:'하노이',hochiminh:'호치민',sapa:'사파',nhatrang:'나트랑',phuquoc:'푸꾸옥'};
    const styleNames={balance:'균형 여행',food:'맛집·카페',nature:'자연·휴양',culture:'문화·역사'};
    const renderPlan = (save=true) => {
      const n=Number(days.value), list=plans[city.value][style.value];
      const items=Array.from({length:n},(_,i)=>list[i%list.length]);
      result.innerHTML = items.map((item,i)=>`<article class="plan-day"><span class="day-no">DAY ${i+1}</span><h3>${item.split(' · ')[0]}</h3><p>${item.split(' · ').slice(1).join(' · ') || '자유 일정 · 휴식'}</p></article>`).join('') +
        `<p class="plan-save">📌 ${cityNames[city.value]} · ${n-1}박 ${n}일 · ${styleNames[style.value]} · 이 일정은 현재 브라우저에 저장됩니다.</p>`;
      if(save) localStorage.setItem('viettripPlan', JSON.stringify({city:city.value,days:days.value,style:style.value}));
    };
    try {
      const saved=JSON.parse(localStorage.getItem('viettripPlan')||'null');
      if(saved){ if(city.querySelector(`option[value="${saved.city}"]`)) city.value=saved.city; days.value=saved.days||'3'; style.value=saved.style||'balance'; }
    } catch(e){}
    make.addEventListener('click',()=>renderPlan(true));
    reset.addEventListener('click',()=>{city.value='danang';days.value='3';style.value='balance';localStorage.removeItem('viettripPlan');renderPlan(false);});
    [city,days,style].forEach(el=>el.addEventListener('change',()=>renderPlan(true)));
    renderPlan(false);
  }

});
