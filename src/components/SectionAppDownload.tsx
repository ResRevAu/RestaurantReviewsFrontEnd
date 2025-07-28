import React from "react";
import { Route } from "@/routers/types";
import Link from "next/link";
import styles from "./SectionAppDownload.module.css";

export interface SectionAppDownloadProps {
  className?: string;
}

const SectionAppDownload: React.FC<SectionAppDownloadProps> = ({
  className = "",
}) => {
  return (
    <section className={`${styles['home-banner-area']} ${className}`}>
      <div className="container">
        <div 
          className="row fullscreen d-flex align-items-center justify-content-between" 
          style={{ height: "565px" }}
        >
          <div className={`${styles['home-banner-content']} col-lg-6 col-md-6`}>
            <h1>
              Restaurant Reviews - <br /> Get the App
            </h1>
            <p>
              Scan the QR Code to download the Restaurant Reviews App on your Phone
            </p>
            <p>
              Its Free - (No in app purchases required)
            </p>
            <p>
              View your next meal before you order it – any where – any time!
            </p>
            <div className={`${styles['download-button']} d-flex flex-row justify-content-start`}>
              <div className={`${styles.buttons} flex-row d-flex`}>
                <i className="la la-apple" aria-hidden="true"></i>
                <div className={styles.desc}>
                  <Link href={"/app-store" as Route}>
                    <p>
                      <span>Available</span> <br />
                      on App Store
                    </p>
                  </Link>
                </div>
              </div>
              <div className={`${styles.buttons} ${styles.dark} flex-row d-flex`}>
                <i className="la la-android" aria-hidden="true"></i>
                <div className={styles.desc}>
                  <Link href={"/play-store" as Route}>
                    <p>
                      <span>Available</span> <br />
                      on Play Store
                    </p>
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <div className={`${styles['banner-img']} col-lg-4 col-md-6`}>
            <img className="img-fluid" src="/images/banner-img.png" alt="Restaurant Reviews App" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SectionAppDownload; 