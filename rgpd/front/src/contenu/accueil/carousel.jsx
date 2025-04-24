import React, { useRef, useState } from "react";
// Import Swiper React components
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
import "swiper/css/pagination";

import "./carousel.css";

// import required modules
import { FreeMode, Pagination } from "swiper/modules";

export default function Carrousel(props) {
  const { equipes } = props;
  
  return (
    <>
      <Swiper
        slidesPerView={3}
        spaceBetween={30}
        freeMode={true}
        pagination={{
          clickable: true,
        }}
        modules={[FreeMode]}
        className="mySwiper"
      >
        {
          equipes.map((equipe) => {
            return (
              <SwiperSlide>
                <img className="joueur" src={equipe.banniere} alt="" />
                <div className="team">
                  <img
                    src={"/equipes" + equipe.logo}
                    alt=""
                    className="logo"
                  />
                  <h1 className="titre">{equipe.nom}</h1>
                </div>
              </SwiperSlide>
            )
          })
        }
      </Swiper>
    </>
  );
}
