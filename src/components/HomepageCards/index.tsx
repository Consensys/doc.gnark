import React from "react";
import clsx from "clsx";
import Link from "@docusaurus/Link";
// import styles from "./styles.module.css";

type CardItem = {
  title: string;
  link: string;
  description: JSX.Element;
  buttonName: string;
  buttonType:
    | "primary"
    | "secondary"
    | "success"
    | "info"
    | "warning"
    | "danger"
    | "link";
};

const CardList: CardItem[] = [
  {
    title: "🏁 Getting Started",
    link: "/category/how-to",
    description: (
      <>
        Create and verify your first zk-SNARK. The quickest way to write, debug
        and profile circuits.
      </>
    ),
    buttonName: "Go to guides",
    buttonType: "success",
  },
  {
    title: "💭 Concepts",
    link: "/category/concepts",
    description: (
      <>
        Check out some general concepts on constraint systems, proving schemes
        and zk-SNARKs.
      </>
    ),
    buttonName: "Go to concepts",
    buttonType: "secondary",
  },
  {
    title: "👨‍💻 Reference",
    link: "/Reference/api",
    description: (
      <>Find API documentation and GoDoc links in the Reference section.</>
    ),
    buttonName: "Go to reference",
    buttonType: "info",
  },
  {
    title: "🛴 Playground",
    link: "https://play.gnark.io",
    description: (
      <>
        Compile and run circuits in your browser. Check out the examples for a
        quick tour.
      </>
    ),
    buttonName: "play.gnark.io",
    buttonType: "link",
  },
];

function Card({ title, link, description, buttonName, buttonType }: CardItem) {
  return (
    <div className={clsx("col", "col--4", "margin-top--md")}>
      <div className="card-demo">
        <div className="card">
          <div className="card__header">
            <h3>{title}</h3>
          </div>
          <div className="card__body">
            <p>{description}</p>
          </div>
          <div className="card__footer">
            <Link
              className={clsx(
                "button",
                "button--" + buttonType,
                "button--block",
              )}
              to={link}>
              {buttonName}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomepageCards(): JSX.Element {
  return (
    <section className={clsx("margin-top--lg", "margin-bottom--lg")}>
      <div className="container">
        <h1>Quick Links</h1>
        <hr />
        <div className="row">
          {CardList.map((props, idx) => (
            <Card key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
