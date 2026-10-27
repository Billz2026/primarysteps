/* Primary Steps Colouring Studio: gallery expansion, part 2 of 2.
   Premium easy-fill SVG artwork. All IDs are stable for per-picture progress. */
(function(){
"use strict";
const P=(n,d)=>'<path data-part="'+n+'" d="'+d+'"/>';
const C=(n,x,y,r)=>'<circle data-part="'+n+'" cx="'+x+'" cy="'+y+'" r="'+r+'"/>';
const E=(n,x,y,rx,ry)=>'<ellipse data-part="'+n+'" cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'"/>';
const R=(n,x,y,w,h,rx=0)=>'<rect data-part="'+n+'" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+rx+'"/>';
const D=d=>'<path d="'+d+'" fill="none" stroke="#273D4B" stroke-width="6" stroke-linecap="round" pointer-events="none"/>';
const A=parts=>parts.join("\n");
const more=[
{id:"cupcake",name:"Cupcake",category:"home",art:A([
 P("cupcake-paper","M268 292 L535 292 L507 451 Q398 466 298 451Z"),
 P("wrapper-stripe-left","M318 298 L348 298 L355 450 L329 450Z"),
 P("wrapper-stripe-right","M448 298 L479 298 L466 450 L439 450Z"),
 P("cake-bottom","M251 284 Q262 254 293 254 L510 254 Q551 255 555 284 Q549 315 521 321 L286 321 Q255 316 251 284Z"),
 P("frosting-lower","M279 253 Q260 208 306 192 Q306 166 354 169 Q396 152 443 167 Q488 161 499 194 Q546 212 523 258 Q501 278 473 255 Q431 283 403 258 Q369 281 342 259 Q300 282 279 253Z"),
 P("frosting-top","M330 169 Q319 125 372 122 Q383 98 408 105 Q442 110 447 133 Q483 142 466 176 Q445 194 416 178 Q385 192 357 174Z"),
 P("cherry-stem","M401 106 Q402 72 440 69 Q435 90 416 107Z"),
 C("cherry",403,109,22),
 C("sprinkle-one",342,216,8),C("sprinkle-two",458,227,8),
 C("sprinkle-three",406,199,8)
])},
{id:"toy-robot",name:"Toy Robot",category:"home",art:A([
 R("left-arm",212,264,64,126,18),R("right-arm",523,264,64,126,18),
 C("left-hand",244,390,29),C("right-hand",556,390,29),
 R("left-foot",312,417,63,53,15),R("right-foot",425,417,63,53,15),
 R("robot-body",290,270,220,175,27),
 R("belly-panel",333,303,132,88,18),
 C("button-one",358,412,13),C("button-two",401,412,13),C("button-three",444,412,13),
 R("robot-head",260,121,280,169,34),
 R("face-screen",288,153,224,102,28),
 C("left-eye",350,200,22),C("right-eye",450,200,22),
 R("mouth",366,239,71,13,7),
 R("neck",376,284,48,20,5),
 R("antenna",392,89,15,36,6),C("antenna-ball",400,77,22),
 C("ear-left",249,204,25),C("ear-right",551,204,25)
])},
{id:"unicorn",name:"Unicorn",category:"fantasy",art:A([
 P("tail","M561 307 Q629 294 649 240 Q686 291 640 351 Q605 377 565 362Z"),
 P("back-leg","M488 358 L538 360 L549 453 L494 453Z"),
 P("front-leg","M315 359 L370 359 L362 451 L305 451Z"),
 P("body","M274 329 Q281 262 408 251 Q520 247 557 320 Q565 385 516 408 L319 408 Q261 398 274 329Z"),
 P("neck","M304 291 Q270 241 291 199 L323 156 Q344 141 366 166 L390 255 L372 316Z"),
 P("mane-back","M296 183 Q266 172 247 207 Q229 249 265 283 Q272 331 319 338 L324 226Z"),
 P("head","M303 163 Q320 126 368 129 Q416 119 455 156 L496 185 Q511 202 494 229 Q452 251 410 224 Q361 248 315 217 Q295 195 303 163Z"),
 P("ear","M323 138 Q310 91 328 83 Q363 89 371 130Z"),
 P("horn","M349 135 L383 48 L401 142Z"),
 P("front-mane","M320 132 Q345 114 364 135 Q383 121 398 145 Q391 180 356 182 Q345 210 318 201Z"),
 P("hoof-left","M304 432 L364 432 L364 455 L303 455Z"),
 P("hoof-right","M492 433 L551 433 L550 455 L494 455Z"),
 C("eye",422,181,10),
 D("M450 213 Q466 224 480 212")
])},
{id:"castle",name:"Castle",category:"fantasy",art:A([
 P("left-tower","M156 207 L265 207 L265 434 L156 434Z"),
 P("right-tower","M531 207 L640 207 L640 434 L531 434Z"),
 P("central-building","M256 267 L540 267 L540 434 L256 434Z"),
 P("central-roof","M249 274 L399 139 L549 274Z"),
 P("left-tower-roof","M137 213 L211 111 L283 213Z"),
 P("right-tower-roof","M514 213 L586 111 L661 213Z"),
 R("door",345,349,107,85,50),
 R("left-window",185,270,46,65,20),R("right-window",566,270,46,65,20),
 R("upper-window",377,256,44,63,19),
 P("flagpole","M398 142 L398 82 L410 82 L410 142Z"),
 P("flag","M408 85 Q447 67 487 91 L455 112 L409 110Z"),
 R("bridge-path",336,431,128,30,8),
 D("M259 396 L344 396 M452 396 L540 396")
])},
{id:"pirate-ship",name:"Pirate Ship",category:"fantasy",art:A([
 P("sea","M105 415 Q161 398 220 413 T350 413 Q420 394 481 413 T617 414 Q661 401 699 414 L699 451 L105 451Z"),
 P("hull","M145 317 L659 317 Q642 411 558 426 L240 426 Q159 405 145 317Z"),
 P("side-stripe","M190 355 L610 355 L582 384 L215 384Z"),
 C("porthole-one",290,367,24),C("porthole-two",404,367,24),C("porthole-three",516,367,24),
 P("back-sail","M364 120 Q288 155 287 298 L362 298Z"),
 P("front-sail","M388 115 Q499 162 534 304 L388 304Z"),
 P("mast","M371 83 L384 83 L384 328 L371 328Z"),
 P("flag","M384 84 L480 104 L384 139Z"),
 P("sun","M634 117 A47 47 0 1 1 633.9 117Z"),
 P("cloud","M135 174 Q119 157 140 141 Q163 137 178 151 Q200 118 230 149 Q259 147 270 172 Q283 189 251 190 L160 190Z"),
 D("M161 320 L645 320")
])},
{id:"dragon",name:"Dragon",category:"fantasy",art:A([
 P("tail","M547 352 Q636 359 656 291 Q697 335 647 390 Q600 420 543 405Z"),
 P("wing","M390 278 Q432 147 495 184 L524 257 Q556 201 597 226 Q581 310 522 334Z"),
 P("spikes","M330 272 L345 220 L369 258 L388 214 L417 260 L444 213 L474 271Z"),
 P("body","M289 319 Q307 264 422 266 Q531 263 556 336 Q571 404 507 426 L328 427 Q266 407 289 319Z"),
 P("back-foot","M462 388 Q505 384 513 426 L507 454 L452 454Z"),
 P("front-foot","M317 388 Q355 383 365 426 L357 454 L301 454Z"),
 P("neck","M314 316 Q282 274 287 218 L316 165 Q341 146 362 163 L375 265Z"),
 P("head","M304 156 Q336 116 393 132 Q434 145 439 181 L495 196 Q518 222 487 242 Q446 255 410 233 Q350 249 315 215 Q290 192 304 156Z"),
 P("nose","M460 206 Q486 197 502 211 Q497 226 467 227Z"),
 P("belly","M365 296 Q393 326 471 320 L493 385 Q427 414 374 378Z"),
 C("eye",396,171,10),
 D("M427 235 Q449 247 470 236")
])},
{id:"christmas-tree",name:"Christmas Tree",category:"celebrations",art:A([
 R("trunk",372,392,56,77,9),
 P("bottom-layer","M400 225 L588 427 Q400 457 210 427Z"),
 P("middle-layer","M400 153 L550 350 Q402 374 250 350Z"),
 P("top-layer","M400 104 L513 278 Q399 293 287 278Z"),
 P("tree-star","M400 51 L418 90 L463 96 L432 125 L439 171 L400 151 L360 171 L368 125 L338 96 L382 90Z"),
 C("ornament-red",318,333,21),C("ornament-blue",471,326,21),
 C("ornament-gold",399,254,19),C("ornament-pink",354,407,20),
 C("ornament-green",492,408,19),
 R("gift-left",170,410,84,62,9),R("gift-right",546,410,86,62,9),
 R("gift-ribbon-left",201,410,20,62,3),R("gift-ribbon-right",578,410,20,62,3)
])},
{id:"easter-egg",name:"Easter Egg",category:"celebrations",art:A([
 P("egg-body","M400 57 C294 58 238 194 229 292 C210 402 280 464 400 465 C519 463 592 403 572 292 C559 191 503 58 400 57Z"),
 P("upper-band","M307 150 Q401 204 492 150 L526 211 Q400 258 273 211Z"),
 P("middle-band","M240 283 Q398 243 560 283 L564 335 Q404 373 236 335Z"),
 P("lower-band","M259 385 Q400 420 541 385 L515 426 Q400 451 286 426Z"),
 C("top-dot-left",367,119,15),C("top-dot-right",432,119,15),
 C("middle-dot-one",301,305,15),C("middle-dot-two",401,304,17),
 C("middle-dot-three",499,305,15),
 C("bottom-dot-left",347,406,13),C("bottom-dot-right",459,405,13),
 P("ground-shadow","M270 468 Q402 484 532 468 Q401 498 270 468Z")
])},
{id:"pumpkin",name:"Pumpkin",category:"celebrations",art:A([
 P("stem","M385 135 Q377 83 411 80 Q443 91 416 145Z"),
 P("leaf","M422 111 Q483 65 534 92 Q495 148 435 139Z"),
 P("left-lobe","M295 164 Q211 151 177 249 Q147 358 239 421 Q276 452 336 432Z"),
 P("right-lobe","M507 165 Q591 154 625 251 Q652 358 563 421 Q524 448 466 432Z"),
 P("middle-lobe-left","M381 151 Q300 130 276 222 Q249 340 326 428 Q367 457 396 438Z"),
 P("middle-lobe-right","M419 151 Q503 133 525 224 Q550 340 470 430 Q434 458 400 438Z"),
 P("centre-lobe","M402 143 Q456 153 457 270 Q460 374 402 445 Q345 375 346 270 Q348 156 402 143Z"),
 P("eye-left","M349 275 Q363 249 380 277 Q376 302 352 302Z"),
 P("eye-right","M424 277 Q439 252 456 278 Q455 303 430 301Z"),
 P("happy-mouth","M352 340 Q399 391 450 341 Q430 411 401 408 Q376 409 352 340Z"),
 D("M387 106 Q390 93 404 94")
])},
{id:"present",name:"Present",category:"celebrations",art:A([
 R("gift-box",228,229,343,230,17),
 R("gift-lid",205,204,391,64,13),
 R("vertical-ribbon",377,268,48,189,4),
 R("horizontal-ribbon",229,314,340,43,3),
 P("bow-left","M400 211 Q337 207 320 157 Q311 116 355 117 Q391 118 408 183 L408 212Z"),
 P("bow-right","M400 211 Q466 207 483 157 Q490 117 448 117 Q412 118 396 183 L396 212Z"),
 C("bow-knot",401,201,26),
 P("ribbon-tail-left","M390 219 Q365 262 339 283 L327 258 L310 251 Q347 224 375 199Z"),
 P("ribbon-tail-right","M413 218 Q445 264 474 279 L481 252 L498 246 Q459 220 424 198Z"),
 C("star-one",150,163,19),C("star-two",651,182,17),
 D("M151 124 L151 107 M652 144 L652 132")
])}
];
const existing=window.PSColouringPictures||[];
const names=new Set(existing.map(p=>p.id));
for(const p of more){
 if(names.has(p.id))throw Error("Duplicate id "+p.id);
 const parts=[...p.art.matchAll(/data-part="([^"]+)"/g)].map(x=>x[1]);
 if(parts.length<6||new Set(parts).size!==parts.length)throw Error("Bad colour regions in "+p.id);
 names.add(p.id);existing.push(p);
}
const ordered=["cat","dog","butterfly","dinosaur","fish",
 "car","fire-engine","train","aeroplane","bus",
 "flower","rainbow","sun-and-clouds","tree","ladybird",
 "house","teddy-bear","balloon","cupcake","toy-robot",
 "unicorn","castle","rocket","pirate-ship","dragon",
 "birthday-cake","christmas-tree","easter-egg","pumpkin","present"];
existing.sort((a,b)=>ordered.indexOf(a.id)-ordered.indexOf(b.id));
})();
