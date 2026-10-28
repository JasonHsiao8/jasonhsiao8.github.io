document.querySelectorAll('.language-switch a').forEach(link=>{link.addEventListener('click',()=>{if(location.hash)link.href=new URL(link.getAttribute('href'),location.href).href+location.hash;});});
