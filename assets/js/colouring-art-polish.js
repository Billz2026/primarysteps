/* Primary Steps · Colouring Book artwork quality pass (2026-10-27).
   Premium contours designed for large finger-sized colour regions.
   Runs after picture registries; picture IDs stay unchanged for saved progress. */
(function(){
"use strict";
const P=(id,d)=>'<path data-part="'+id+'" d="'+d+'"/>';
const C=(id,x,y,r)=>'<circle data-part="'+id+'" cx="'+x+'" cy="'+y+'" r="'+r+'"/>';
const E=(id,x,y,rx,ry)=>'<ellipse data-part="'+id+'" cx="'+x+'" cy="'+y+'" rx="'+rx+'" ry="'+ry+'"/>';
const R=(id,x,y,w,h,rx=0)=>'<rect data-part="'+id+'" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+rx+'"/>';
const L=d=>'<path d="'+d+'" stroke="#273D4B" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round" pointer-events="none"/>';
const Dot=(x,y,r=7)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="#273D4B" stroke="none" pointer-events="none"/>';
const A=(...parts)=>parts.join("\n");
const polish={
train:A(
 P("smoke-three","M384 92 C363 82 368 58 387 58 C399 33 427 45 428 62 C450 59 460 83 446 96Z"),
 P("smoke-two","M455 119 C445 97 463 91 477 97 Q489 81 510 96 Q527 119 510 131Z"),
 R("train-track",110,446,580,14,7),
 P("rear-carriage","M124 248 Q125 220 152 220 L329 220 Q355 222 355 250 L355 386 L122 386Z"),
 R("rear-window-one",151,249,78,74,15),
 R("rear-window-two",248,249,78,74,15),
 R("carriage-band",128,340,219,23,9),
 P("front-carriage","M379 220 Q380 198 406 197 L562 197 Q621 200 646 259 L663 329 L663 387 L380 387Z"),
 P("front-window","M405 229 Q406 218 423 218 L515 218 L515 314 L405 314Z"),
 P("driver-window","M535 218 L562 218 Q606 221 618 275 L627 312 L535 312Z"),
 P("train-cowcatcher","M640 352 L694 374 L677 403 L635 392Z"),
 R("locomotive-stripe",392,336,233,24,10),
 R("chimney",438,163,44,41,8),
 P("headlamp","M621 315 L648 315 L651 337 L621 337Z"),
 C("wheel-one",184,394,44),
 C("wheel-two",294,394,44),
 C("wheel-three",463,395,46),
 C("wheel-four",580,395,46),
 C("wheel-hub-one",184,394,19),C("wheel-hub-two",294,394,19),
 C("wheel-hub-three",463,395,20),C("wheel-hub-four",580,395,20),
 L("M359 357 L380 357")
),
aeroplane:A(
 P("cloud-left","M112 404 Q87 390 107 369 Q125 355 147 365 Q167 335 198 352 Q231 346 246 373 Q275 378 266 407 Z"),
 P("cloud-right","M563 149 Q543 126 570 113 Q587 108 608 123 Q625 94 652 110 Q680 104 695 131 Q721 132 714 157 Z"),
 P("rear-wing","M173 263 L123 194 Q119 185 134 184 L160 186 L264 254Z"),
 P("tail-wing","M170 292 L139 374 Q135 389 155 383 L280 318Z"),
 P("far-wing","M337 265 L407 164 Q417 149 434 156 L455 162 L428 277Z"),
 P("airplane-body","M102 286 Q164 258 279 255 L551 254 Q623 253 685 281 Q708 292 694 312 Q646 345 543 346 L276 342 Q160 339 103 309 Q86 299 102 286Z"),
 P("cockpit","M595 260 Q638 266 677 283 Q686 290 666 301 L594 301Z"),
 C("window-one",292,299,14),C("window-two",339,299,14),
 C("window-three",387,299,14),C("window-four",435,299,14),
 P("main-wing","M345 296 L432 116 Q439 102 455 109 L483 118 Q498 126 491 144 L451 303 L402 367 Q391 378 377 367 L343 334Z"),
 P("wingtip","M430 129 L454 119 Q469 127 464 144 L452 177 L416 162Z"),
 P("nose-tip","M670 276 Q696 283 700 296 Q699 311 670 319 L655 310 L673 294Z"),
 L("M180 283 Q200 286 226 285")
),
bus:A(
 P("bus-body","M141 176 Q145 139 191 139 L586 139 Q648 140 668 180 L681 220 L681 393 Q681 417 653 420 L147 420 Q119 417 119 390 L119 220 Q119 192 141 176Z"),
 R("route-sign",228,153,241,40,13),
 R("window-one",151,216,87,90,12),
 R("window-two",255,216,87,90,12),
 R("window-three",357,216,87,90,12),
 P("windscreen","M561 216 L617 216 Q650 223 656 254 L656 307 L561 307Z"),
 R("door",464,214,80,203,12),
 R("side-stripe",139,334,521,23,8),
 P("front-grille","M609 366 L660 366 L660 390 L609 390Z"),
 C("headlamp",641,327,12),
 C("wheel-a",238,418,52),C("wheel-b",561,418,52),
 C("wheel-centre-a",238,418,22),C("wheel-centre-b",561,418,22),
 L("M504 217 L504 414 M468 326 L540 326")
),
balloon:A(
 P("balloon-left","M219 104 C149 104 115 175 127 234 Q137 294 219 351 Q301 294 310 234 C323 175 289 104 219 104Z"),
 P("balloon-mid","M402 67 C322 67 286 149 298 220 Q312 291 402 357 Q489 292 505 220 C518 150 482 67 402 67Z"),
 P("balloon-right","M585 105 C514 105 480 177 492 235 Q505 299 585 352 Q667 296 678 235 C689 177 653 105 585 105Z"),
 P("knot-left","M210 344 L229 344 L239 363 L199 363Z"),
 P("knot-mid","M392 350 L413 350 L422 369 L383 369Z"),
 P("knot-right","M575 345 L595 345 L605 363 L566 363Z"),
 L("M220 367 Q231 402 215 435 Q209 459 238 468 M402 373 Q386 402 408 434 Q427 458 403 474 M585 367 Q600 401 581 436 Q571 458 594 468"),
 L("M169 162 Q150 194 161 224 M349 123 Q331 159 341 191 M536 166 Q519 203 530 226"),
 C("confetti-left",121,96,12),C("confetti-right",665,82,11),
 P("confetti-star","M406 401 L415 423 L439 425 L421 439 L428 463 L405 451 L384 464 L390 438 L373 423 L397 421Z")
),
"toy-robot":A(
 R("antenna",389,72,23,68,11),C("antenna-ball",401,65,24),
 C("ear-left",251,225,34),C("ear-right",551,225,34),
 P("left-arm","M292 303 Q253 273 226 290 Q203 304 210 352 L225 404 Q248 424 276 404 L305 369Z"),
 P("right-arm","M509 303 Q547 274 577 294 Q593 311 588 355 L573 404 Q546 424 524 403 L495 368Z"),
 C("left-hand",241,411,28),C("right-hand",559,411,28),
 R("left-foot",306,418,78,55,21),R("right-foot",419,418,78,55,21),
 R("robot-body",283,269,235,182,40),
 R("belly-panel",319,300,161,108,23),
 P("heart-button","M399 342 Q369 311 354 339 Q340 363 399 395 Q456 363 441 340 Q425 311 399 342Z"),
 C("belly-button-left",336,426,10),C("belly-button-right",464,426,10),
 R("neck",372,259,57,36,9),
 R("robot-head",267,137,269,150,39),
 R("face-screen",295,163,211,105,29),
 E("left-eye",355,207,17,23),E("right-eye",445,207,17,23),
 P("smile","M363 237 Q399 265 438 237 L438 246 Q401 282 363 246Z"),
 C("cheek-left",326,241,10),C("cheek-right",474,241,10)
),
unicorn:A(
 P("tail","M552 312 Q635 282 650 228 Q694 280 641 359 Q600 385 550 378Z"),
 P("back-leg","M483 367 L537 374 L541 459 L487 459Z"),
 P("front-leg","M322 369 L373 365 L370 459 L313 459Z"),
 P("body","M291 319 Q318 264 418 266 Q531 263 560 327 Q577 380 539 412 Q450 440 344 417 Q281 393 291 319Z"),
 P("neck","M312 314 Q277 274 294 209 Q313 160 357 171 L386 276 L383 358Z"),
 P("back-mane","M327 157 Q276 149 260 208 Q246 265 278 299 Q302 326 338 317Z"),
 P("ear","M322 158 Q312 116 333 100 Q361 104 375 151Z"),
 P("horn","M371 148 L389 66 Q393 54 400 71 L422 158Z"),
 P("head","M311 164 Q335 127 396 134 Q450 142 476 178 L520 199 Q541 215 522 239 Q502 264 456 251 Q411 249 375 262 Q324 258 305 222 Q294 190 311 164Z"),
 P("muzzle","M447 211 Q486 201 519 219 Q516 252 478 253 Q448 254 432 234Z"),
 P("front-mane","M342 143 Q365 116 388 142 Q411 127 431 155 Q422 183 394 191 Q371 217 337 200Z"),
 P("hoof-left","M307 435 L375 435 L374 461 L302 461Z"),
 P("hoof-right","M484 436 L543 436 L543 462 L484 462Z"),
 C("eye",414,190,9),
 L("M480 236 Q499 244 511 233")
),
"pirate-ship":A(
 P("sea","M97 426 Q157 402 217 426 Q274 446 328 423 Q385 404 440 424 Q508 442 567 423 Q641 401 711 425 L711 452 L97 452Z"),
 P("hull","M146 341 L657 341 Q621 415 546 430 L253 430 Q177 412 146 341Z"),
 P("hull-stripe","M180 362 L625 362 Q608 394 578 402 L222 402 Q198 392 180 362Z"),
 C("porthole-one",294,382,20),C("porthole-two",399,382,20),C("porthole-three",505,382,20),
 R("mast",380,96,17,260,4),
 P("left-sail","M360 133 Q294 174 267 318 L359 318Z"),
 P("right-sail","M416 133 Q510 185 539 322 L416 322Z"),
 P("top-flag","M397 96 Q443 77 484 103 L463 126 Q424 112 397 132Z"),
 P("ship-rail","M174 316 L626 316 L626 344 L174 344Z"),
 P("cloud","M138 174 Q128 150 154 140 Q177 133 193 150 Q209 121 244 146 Q275 145 283 172 Q292 190 257 191 L158 191Z"),
 C("sun",643,154,39),
 L("M642 92 L642 76 M701 155 L718 155 M595 154 L579 154")
),
dragon:A(
 P("tail","M539 369 Q635 376 657 287 Q703 345 647 418 Q601 454 533 420Z"),
 P("wing-left","M345 309 Q304 184 239 199 Q251 246 218 268 Q272 272 279 334Z"),
 P("wing-right","M460 309 Q499 179 558 200 Q546 246 587 270 Q522 273 518 342Z"),
 P("back-spikes","M353 304 L363 263 L385 289 L404 257 L426 287 L449 260 L467 310Z"),
 P("left-foot","M314 397 Q336 386 369 402 L370 457 L300 457Z"),
 P("right-foot","M441 404 Q471 388 497 399 L509 457 L439 457Z"),
 P("dragon-body","M317 296 Q344 258 403 262 Q465 260 501 298 Q535 371 510 416 Q469 461 404 450 Q332 458 302 411 Q286 362 317 296Z"),
 E("tummy",403,369,79,68),
 P("ear-left","M321 201 Q289 146 321 123 Q352 147 367 188Z"),
 P("ear-right","M474 201 Q512 146 479 123 Q450 143 436 188Z"),
 P("head","M310 202 Q320 135 400 131 Q486 133 491 205 Q519 239 488 268 Q460 303 404 303 Q348 306 313 268 Q284 240 310 202Z"),
 E("snout",405,254,73,43),
 C("eye-left",358,210,11),C("eye-right",448,210,11),
 C("nostril-left",388,262,6),C("nostril-right",425,262,6),
 L("M375 276 Q404 300 436 275")
),
"christmas-tree":A(
 R("trunk",372,407,56,63,9),
 P("main-tree","M400 122 L485 229 L463 229 L549 337 L521 337 L598 424 Q404 462 201 424 L279 337 L248 337 L336 228 L313 228Z"),
 P("upper-branch","M400 122 L470 239 Q401 256 330 239Z"),
 P("middle-branch","M330 250 L470 250 L536 350 Q400 378 265 350Z"),
 P("lower-branch","M262 364 L538 364 L589 424 Q402 451 215 424Z"),
 P("tree-star","M401 60 L420 98 L463 104 L432 134 L439 177 L401 155 L360 177 L370 135 L339 104 L380 99Z"),
 C("ornament-red",334,328,20),C("ornament-blue",463,327,20),
 C("ornament-gold",402,241,18),C("ornament-pink",357,410,21),
 C("ornament-green",492,412,20),
 R("gift-left",166,415,84,55,10),R("gift-right",549,414,86,56,10),
 R("gift-ribbon-left",199,415,18,55,3),R("gift-ribbon-right",581,414,18,56,3)
),
present:A(
 P("box","M228 266 Q228 250 244 250 L556 250 Q572 250 572 266 L572 442 Q572 458 557 458 L244 458 Q228 457 228 441Z"),
 R("lid",205,209,390,66,14),
 P("ribbon-down","M380 276 L421 276 L421 458 L380 458Z"),
 P("ribbon-across","M229 324 L571 324 L571 364 L229 364Z"),
 P("bow-left","M399 204 Q327 210 320 156 Q317 111 364 124 Q395 129 411 178Z"),
 P("bow-right","M402 204 Q474 210 481 156 Q485 111 437 124 Q407 129 391 178Z"),
 P("bow-tail-left","M383 209 Q352 256 315 278 L319 247 L299 235 Q335 216 371 190Z"),
 P("bow-tail-right","M417 208 Q449 256 485 278 L481 247 L500 235 Q465 216 429 190Z"),
 C("bow-knot",401,197,24),
 P("sparkle-one","M160 156 L173 178 L199 183 L175 197 L168 221 L154 200 L129 195 L151 179Z"),
 P("sparkle-two","M638 138 L647 157 L667 163 L649 174 L643 193 L632 173 L613 167 L632 158Z"),
 C("confetti-one",155,303,10),C("confetti-two",653,310,11)
)};
const target=window.PSColouringPictures;
if(!Array.isArray(target))throw Error("Colouring registry not loaded");
for(const [id,art] of Object.entries(polish)){
 const p=target.find(p=>p.id===id);
 if(!p)throw Error("Missing "+id);
 const names=[...art.matchAll(/data-part="([^"]+)"/g)].map(m=>m[1]);
 if(names.length<9||new Set(names).size!==names.length)throw Error("Bad regions "+id);
 p.art=art;
}
})();
