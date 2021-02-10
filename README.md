# wyr
no tak podme na to
system suborov som ukkradol odtialto:
https://www.youtube.com/watch?v=jD7FnbI76Hg&t=503s
tiez je to uzasny navod na zaciatok prace so socket io

deploy je cez heroku
https://dashboard.heroku.com/apps
vsetko sa da spravit pekne cez gui
prepojil som  to s githubom a teraz kazdy deploy aktualizuje automaticky aj stranku
na vlastnu adresu som pouzil freenom
tam som si vybral vlastnu adresu
aby som prepojil freenom a heroku, pouzil som tento navod:
https://www.lewagon.com/blog/buying-a-domain-on-namecheap-and-pointing-it-to-heroku
NEZABUDNUT na to, ze treba dat po adrese bodku
aby som to vedel testovat u seba:
  1)Musim stiahnut zlozku z GIT hubu k sebe
  2)Otvorit commandline a cd do zlozky z gitu
  3)  npm init
      npm install express socket.io moments
      npm install -D nodemon
  4)nodemon run dev
