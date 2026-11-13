/* ToolNest logo guard: if a local logo fails, show a clean monogram instead of a broken image. */
(function(){
  function label(img){
    return (img.getAttribute('alt')||'').replace(/\s+logo$/i,'').trim();
  }
  function fail(img){
    var tile=img.closest?img.closest('.tile.has-logo'):null;
    img.style.display='none';
    img.setAttribute('data-logo-failed','1');
    if(tile){
      var fb=tile.querySelector('.logo-fallback');
      if(!fb){
        fb=document.createElement('span');
        fb.className='logo-fallback';
        tile.insertBefore(fb,tile.firstChild);
      }
      if(!fb.textContent.replace(/\s/g,''))fb.textContent=(label(img).charAt(0)||'?').toUpperCase();
      tile.classList.add('logo-failed');
      return;
    }
    if(img.classList.contains('wm')){
      var next=img.nextElementSibling;
      if(!next||!next.classList||!next.classList.contains('wm-fallback')){
        var span=document.createElement('span');
        span.className='wm-fallback';
        span.textContent=label(img)||'Logo';
        img.parentNode.insertBefore(span,img.nextSibling);
      }
    }
  }
  function isLogo(img){
    return !!img&&img.tagName==='IMG'&&(img.hasAttribute('data-logo')||img.classList.contains('wm')||!!(img.closest&&img.closest('.tile.has-logo')));
  }
  document.addEventListener('error',function(e){
    if(isLogo(e.target))fail(e.target);
  },true);
  function sweep(){
    var imgs=document.querySelectorAll('img[data-logo],img.wm,.tile.has-logo img');
    for(var i=0;i<imgs.length;i++){
      if(imgs[i].complete&&imgs[i].naturalWidth===0)fail(imgs[i]);
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',sweep);
  else sweep();
  window.addEventListener('load',sweep);
})();

/* ToolNest mobile menu: opens and closes the #mnav panel from the header button. */
(function(){
  var btn=document.querySelector('.mnav-toggle'),panel=document.getElementById('mnav');
  if(!btn||!panel)return;
  var header=btn.closest('header')||document;
  var mq=window.matchMedia('(max-width:900px)');
  function isOpen(){return btn.getAttribute('aria-expanded')==='true';}
  function setOpen(open,refocus){
    btn.setAttribute('aria-expanded',open?'true':'false');
    panel.hidden=!open;
    if(!open&&refocus)btn.focus();
  }
  btn.addEventListener('click',function(){setOpen(!isOpen());});
  document.addEventListener('keydown',function(e){
    if(e.key==='Escape'&&isOpen()){setOpen(false,true);}
  });
  document.addEventListener('click',function(e){
    if(!isOpen()||btn.contains(e.target))return;
    if(panel.contains(e.target)){if(e.target.closest('a'))setOpen(false);return;}
    setOpen(false);
  });
  header.addEventListener('focusout',function(e){
    if(isOpen()&&e.relatedTarget&&!header.contains(e.relatedTarget))setOpen(false);
  });
  function onChange(){if(!mq.matches)setOpen(false);}
  if(mq.addEventListener)mq.addEventListener('change',onChange);else if(mq.addListener)mq.addListener(onChange);
  /* mark where the visitor is */
  var here=location.pathname.replace(/index\.html$/,'');
  var links=panel.querySelectorAll('a:not(.btn)');
  for(var i=0;i<links.length;i++){
    var base=new URL(links[i].getAttribute('href'),location.href).pathname.replace(/index\.html$/,'');
    if(base==='/'){if(here==='/')links[i].setAttribute('aria-current','page');}
    else if(here===base)links[i].setAttribute('aria-current','page');
    else if(here.indexOf(base)===0)links[i].setAttribute('aria-current','true');
  }
})();
