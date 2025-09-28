  /* ---------------------- PARTICLE SYSTEM ---------------------- */
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');
    let w = canvas.width = innerWidth;
    let h = canvas.height = innerHeight;

    window.addEventListener('resize', () => { w = canvas.width = innerWidth; h = canvas.height = innerHeight; });

    class Particle{
      constructor(x,y,dx,dy,size,life,color){
        this.x=x;this.y=y;this.dx=dx;this.dy=dy;this.size=size;this.life=life;this.ttl=life;this.color=color;this.rot=(Math.random()*360)|0
      }
      update(dt){
        this.x += this.dx * dt;
        this.y += this.dy * dt;
        this.dy += 0.0008 * dt; // small gravity
        this.ttl -= dt;
      }
      draw(ctx){
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, this.ttl/this.life));
        ctx.translate(this.x,this.y);
        ctx.rotate(this.rot*Math.PI/180);
        ctx.beginPath();
        ctx.fillStyle = this.color;
        ctx.arc(0,0,this.size,0,Math.PI*2);
        ctx.fill();
        ctx.restore();
      }
    }

    const particles = [];

    // small ambient floating particles
    function spawnAmbient(){
      if(Math.random() > 0.6) return;
      const x = Math.random()*w;
      const y = Math.random()*h;
      const size = 0.8 + Math.random()*2.2;
      const dx = (Math.random()-0.5)*0.04;
      const dy = (Math.random()-0.5)*0.04;
      const color = 'rgba(124,92,255,0.06)';
      particles.push(new Particle(x,y,dx,dy,size,400+Math.random()*800,color));
    }

    let last = performance.now();
    function loop(now){
      const dt = (now - last);
      last = now;
      ctx.clearRect(0,0,w,h);

      // subtle background glow
      const grd = ctx.createLinearGradient(0,0,w,h);
      grd.addColorStop(0, 'rgba(124,92,255,0.02)');
      grd.addColorStop(1, 'rgba(60,231,201,0.02)');
      ctx.fillStyle = grd;
      ctx.fillRect(0,0,w,h);

      // ambient lines
      ctx.globalCompositeOperation = 'lighter';
      spawnAmbient();

      for(let i = particles.length-1;i>=0;i--){
        const p = particles[i];
        p.update(dt);
        p.draw(ctx);
        if(p.ttl <= 0 || p.x < -50 || p.y > h+50) particles.splice(i,1);
      }

      // tiny star sparkles
      if(Math.random() < 0.02){
        const x = Math.random()*w; const y = Math.random()*h*0.6; const size = 0.6+Math.random()*1.6;
        ctx.beginPath(); ctx.globalAlpha=0.9; ctx.fillStyle='rgba(255,255,255,0.06)'; ctx.arc(x,y,size,0,Math.PI*2); ctx.fill();
      }

      ctx.globalCompositeOperation = 'source-over';
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    /* ------------------- EXPLOSION on button press ------------------- */
    function explode(x,y,baseColor){
      const huePool = baseColor === 'accent' ? [[124,92,255],[60,231,201]] : [[255,200,80],[255,120,120]];
      for(let i=0;i<60;i++){
        const angle = Math.random()*Math.PI*2;
        const speed = 0.4 + Math.random()*4.2;
        const dx = Math.cos(angle)*speed;
        const dy = Math.sin(angle)*speed;
        const size = 1 + Math.random()*4;
        const life = 400 + Math.random()*700;
        const col = Math.random()>0.5 ? `rgba(${huePool[0][0]},${huePool[0][1]},${huePool[0][2]},${0.9*Math.random()})` : `rgba(${huePool[1][0]},${huePool[1][1]},${huePool[1][2]},${0.9*Math.random()})`;
        particles.push(new Particle(x,y,dx,dy,size,life,col));
      }
    }

    /* ------------------- BUTTON RIPPLES & PRESS ------------------- */
    function createRipple(btn, evt){
      const rect = btn.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      const size = Math.max(rect.width, rect.height)*1.4;
      ripple.style.width = ripple.style.height = size + 'px';
      ripple.style.left = (evt.clientX - rect.left - size/2) + 'px';
      ripple.style.top = (evt.clientY - rect.top - size/2) + 'px';
      ripple.style.background = 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.16), rgba(255,255,255,0.02))';
      btn.appendChild(ripple);
      // animate
      ripple.animate([
        {transform:'scale(0)', opacity:0.9},
        {transform:'scale(1.2)', opacity:0}
      ],{duration:700, easing:'cubic-bezier(.2,.9,.2,1)'}).onfinish = ()=> ripple.remove();
    }

    document.querySelectorAll('.btn').forEach(btn=>{
      btn.addEventListener('pointerdown', (e)=>{
        createRipple(btn,e);
        btn.animate([{transform:'translateY(0) scale(1)'},{transform:'translateY(4px) scale(0.995)'}],{duration:160,fill:'forwards',easing:'cubic-bezier(.2,.9,.2,1)'});
      });
    });

    /* ------------- fake login + success feedback -------------- */
    const form = document.getElementById('login-form');
    const feedback = document.getElementById('feedback');
    form.addEventListener('submit', (e)=>{
      e.preventDefault();
      // micro-check
      const email = form.email.value.trim();
      const pwd = form.password.value.trim();
      feedback.innerHTML = '';

      // shake if invalid
      if(!email || !pwd){
        const el = document.createElement('div'); el.className='muted'; el.textContent='Fill all fields.'; feedback.appendChild(el);
        // little wiggle
        const card = document.querySelector('.card');
        card.animate([{transform:'translateX(0)'},{transform:'translateX(-8px)'},{transform:'translateX(6px)'},{transform:'translateX(0)'}],{duration:420,easing:'cubic-bezier(.2,.9,.2,1)'});
        return;
      }

      const btn = document.getElementById('btn-login');
      btn.disabled = true; btn.style.opacity = 0.9; btn.textContent = 'Caricamento...';

      // simulate processing with dots
      let dot = 0; const int = setInterval(()=>{ btn.textContent = 'Caricamento' + '.'.repeat(dot%4); dot++; }, 420);

      setTimeout(()=>{
        clearInterval(int);
        // success
        btn.textContent = 'Benvenuto!';
        const msg = document.createElement('div'); msg.className='success-msg'; msg.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 12.5L11.5 15L16 10" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg><div>Accesso riuscito</div>';
        feedback.appendChild(msg);

        // explosion at button location
        const rect = btn.getBoundingClientRect();
        const x = rect.left + rect.width/2; const y = rect.top + rect.height/2;
        explode(x, y, 'accent');

        // small success pulse on hero badge
        const badge = document.querySelector('.badge');
        badge.animate([{transform:'scale(1)'},{transform:'scale(1.08)'},{transform:'scale(1)'}],{duration:800,easing:'cubic-bezier(.2,.9,.2,1)'});

        // reset
        setTimeout(()=>{ btn.disabled=false; btn.textContent='Accedi'; }, 1400);

      }, 1200);

    });

    /* guest button: quick micro-animation */
    document.getElementById('btn-guest').addEventListener('click', (e)=>{
      const btn = e.currentTarget;
      createRipple(btn, {clientX: btn.getBoundingClientRect().left + btn.getBoundingClientRect().width/2, clientY: btn.getBoundingClientRect().top + btn.getBoundingClientRect().height/2});
      explode(btn.getBoundingClientRect().left + btn.offsetWidth/2, btn.getBoundingClientRect().top + btn.offsetHeight/2, 'guest');
      // tiny toast
      const f = document.getElementById('feedback'); f.innerHTML = '<div class="muted">Accesso come ospite...</div>';
      setTimeout(()=>{ f.innerHTML=''; }, 1400);
    });

    /* little accessibility: press Enter triggers login */
    document.addEventListener('keydown', (e)=>{ if(e.key === 'Enter' && document.activeElement.tagName==='INPUT') document.querySelector('#btn-login').click(); });
