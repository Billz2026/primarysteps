/* Colouring Studio secondary artwork QA: soft nursery shapes,
   readable expressive faces, generous tap-to-colour regions. */
(function(){
"use strict";
const P=(n,d)=>'<path data-part="'+n+'" d="'+d+'"/>';
const C=(n,x,y,r)=>'<circle data-part="'+n+'" cx="'+x+'" cy="'+y+'" r="'+r+'"/>';
const E=(n,x,y,a,b)=>'<ellipse data-part="'+n+'" cx="'+x+'" cy="'+y+'" rx="'+a+'" ry="'+b+'"/>';
const R=(n,x,y,w,h,r=0)=>'<rect data-part="'+n+'" x="'+x+'" y="'+y+'" width="'+w+'" height="'+h+'" rx="'+r+'"/>';
const L=d=>'<path d="'+d+'" fill="none" stroke="#273D4B" stroke-width="6" stroke-linecap="round" stroke-linejoin="round" pointer-events="none"/>';
const D=(x,y,r=7)=>'<circle cx="'+x+'" cy="'+y+'" r="'+r+'" fill="#273D4B" stroke="none" pointer-events="none"/>';
const A=(...a)=>a.join("\n");
const edits={
"sun-and-clouds":A(
 P("ray-top","M385 58 L398 22 L412 58Z"),
 P("ray-left","M255 157 L220 136 L253 127Z"),
 P("ray-right","M549 156 L581 132 L553 125Z"),
 P("ray-bottom-left","M293 298 L270 327 L306 313Z"),
 P("ray-bottom-right","M494 300 L524 326 L503 313Z"),
 C("sun-disc",400,198,123),
 C("sun-cheek-left",351,245,15),C("sun-cheek-right",449,245,15),
 P("left-cloud","M94 358 Q82 335 105 317 Q121 306 146 312 Q142 272 186 257 Q227 249 247 286 Q290 275 311 309 Q359 306 363 347 Q365 380 317 383 L141 383 Q104 387 94 358Z"),
 P("right-cloud","M447 374 Q427 343 458 329 Q479 317 501 329 Q511 285 555 282 Q589 272 612 310 Q654 303 678 338 Q697 380 650 389 L499 389 Q466 391 447 374Z"),
 D(358,197,9),D(443,197,9),
 L("M372 254 Q400 274 428 254")
),
tree:A(
 P("trunk","M371 284 Q386 291 425 286 L441 459 L360 459Z"),
 P("branch-left","M387 337 Q338 298 310 276 L324 254 L410 307Z"),
 P("branch-right","M416 333 Q475 276 492 253 L516 274 L429 366Z"),
 P("canopy-left","M190 250 Q180 196 229 165 Q227 124 280 108 Q319 96 347 130 Q389 121 411 161 Q449 180 428 231 Q455 273 412 306 Q358 341 304 309 Q246 337 205 303Z"),
 P("canopy-right","M389 221 Q392 161 451 146 Q477 103 523 135 Q565 126 590 174 Q648 185 645 243 Q651 299 588 312 Q554 344 508 314 Q446 339 410 290Z"),
 P("canopy-top","M277 178 Q264 125 316 97 Q342 54 388 78 Q425 50 461 83 Q512 68 532 121 Q541 174 490 202 Q448 230 400 205 Q330 232 294 204Z"),
 C("apple-one",303,247,24),C("apple-two",506,249,24),C("apple-three",399,153,23),
 P("grass-left","M245 462 Q260 433 284 459 L325 459 L325 476 L245 476Z"),
 P("grass-right","M475 458 Q496 436 516 457 L552 457 L552 475 L475 475Z")
),
ladybird:A(
 P("leaf","M134 420 Q310 454 405 398 Q521 327 668 375 Q590 465 400 462 Q254 467 134 420Z"),
 P("back-body","M243 253 Q265 159 398 158 Q535 157 558 255 Q564 358 473 382 L326 382 Q233 347 243 253Z"),
 P("left-wing","M270 240 Q306 185 389 191 L389 363 Q295 362 265 307Z"),
 P("right-wing","M406 191 Q492 186 532 238 L537 306 Q511 362 405 364Z"),
 P("head","M335 185 Q344 133 400 133 Q456 133 470 185 Q462 218 397 229 Q339 217 335 185Z"),
 C("spot-left-a",316,252,24),C("spot-left-b",335,328,19),
 C("spot-right-a",483,252,24),C("spot-right-b",465,328,19),
 C("head-cheek-left",367,200,8),C("head-cheek-right",435,200,8),
 D(373,176,7),D(429,176,7),
 L("M381 207 Q402 219 419 207 M375 141 L357 109 M428 140 L445 109")
),
"teddy-bear":A(
 C("left-ear",308,131,70),C("right-ear",494,131,70),
 C("left-ear-centre",308,131,35),C("right-ear-centre",494,131,35),
 P("left-arm","M304 296 Q257 262 224 303 Q195 347 224 392 Q251 426 292 401 L329 355Z"),
 P("right-arm","M491 296 Q545 267 579 309 Q608 353 571 402 Q541 425 508 395 L471 350Z"),
 P("body","M313 303 Q342 265 399 271 Q471 265 496 306 Q523 352 506 412 Q474 466 400 469 Q324 466 294 414 Q281 348 313 303Z"),
 E("tummy",401,375,67,63),
 E("left-foot",305,451,69,40),E("right-foot",496,451,69,40),
 E("left-foot-pad",305,454,32,19),E("right-foot-pad",496,454,32,19),
 C("head",400,209,123),
 E("snout",400,263,65,42),
 P("nose","M378 250 Q399 235 422 250 Q418 265 400 272 Q381 266 378 250Z"),
 D(357,204,9),D(443,204,9),
 L("M400 272 L400 287 Q381 301 364 285 M400 287 Q418 302 437 285")
),
cupcake:A(
 P("cupcake-paper","M259 297 L543 297 L509 454 Q400 473 293 454Z"),
 P("wrapper-left-fold","M311 315 L340 314 L348 450 L319 450Z"),
 P("wrapper-right-fold","M460 313 L491 315 L482 451 L450 451Z"),
 P("cake-base","M253 265 Q255 244 281 244 L520 244 Q544 245 551 265 L552 298 L250 298Z"),
 P("bottom-frosting","M271 250 Q259 219 289 199 Q308 184 335 193 Q351 159 396 170 Q425 158 450 190 Q487 181 513 203 Q539 230 519 255 Q499 271 471 250 Q438 270 401 253 Q367 272 335 253 Q296 269 271 250Z"),
 P("top-frosting","M332 195 Q305 153 348 130 Q369 117 391 135 Q405 110 427 123 Q465 148 453 183 Q443 206 408 201 Q375 222 332 195Z"),
 P("frosting-swish","M366 135 Q359 99 397 88 Q430 94 435 128 Q414 145 387 142Z"),
 C("cherry",401,91,23),
 P("cherry-leaf","M405 73 Q412 43 445 45 Q437 70 412 83Z"),
 C("sprinkle-one",317,236,9),C("sprinkle-two",479,235,9),C("sprinkle-three",403,219,9)
),
pumpkin:A(
 P("stem","M380 146 Q382 98 401 85 Q424 87 421 150Z"),
 P("leaf","M417 124 Q455 77 511 100 Q489 147 428 152Z"),
 P("left-lobe","M307 190 Q232 148 186 227 Q141 316 199 402 Q244 455 315 437Z"),
 P("right-lobe","M495 190 Q569 150 612 228 Q660 314 603 404 Q558 457 485 437Z"),
 P("left-centre-lobe","M368 175 Q311 152 272 233 Q236 340 301 422 Q336 462 389 442Z"),
 P("right-centre-lobe","M429 174 Q486 151 524 233 Q559 341 496 422 Q458 464 407 440Z"),
 P("centre-lobe","M398 160 Q455 176 459 290 Q453 399 400 451 Q345 405 343 292 Q346 176 398 160Z"),
 P("eye-left","M354 284 Q367 264 382 286 Q380 306 359 308Z"),
 P("eye-right","M418 285 Q431 266 445 285 Q444 307 423 307Z"),
 P("happy-mouth","M353 347 Q397 374 446 347 Q425 395 398 400 Q370 392 353 347Z"),
 L("M399 85 Q404 67 430 67")
),
"easter-egg":A(
 P("egg","M398 52 Q494 58 552 189 Q596 299 572 386 Q550 466 402 470 Q253 467 226 386 Q206 295 249 188 Q309 57 398 52Z"),
 P("top-band","M305 153 Q400 199 491 153 L521 216 Q404 257 278 216Z"),
 P("middle-band","M231 284 Q401 248 568 284 L572 336 Q402 378 228 336Z"),
 P("bottom-band","M258 392 Q405 424 544 392 L519 435 Q406 459 283 435Z"),
 C("top-dot-left",367,112,14),C("top-dot-right",433,112,14),
 C("middle-dot-left",301,310,17),C("middle-dot",400,310,17),C("middle-dot-right",500,310,17),
 P("flower-left","M336 248 L347 264 L368 266 L351 280 L357 300 L337 287 L318 300 L323 280 L306 266 L329 264Z"),
 P("flower-right","M461 248 L471 264 L492 266 L475 280 L481 300 L461 287 L443 300 L448 280 L432 266 L453 264Z")
)};
const registry=window.PSColouringPictures;
for(const [id,art] of Object.entries(edits)){
 const p=registry.find(p=>p.id===id);if(!p)throw Error("Missing "+id);
 const parts=[...art.matchAll(/data-part="([^"]+)"/g)].map(x=>x[1]);
 if(parts.length<7||new Set(parts).size!==parts.length)throw Error("Bad regions "+id);
 p.art=art;
}
})();
