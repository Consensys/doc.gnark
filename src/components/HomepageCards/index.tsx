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
        The quickest way to get started by either deploying with Docker,
        standalone binary or building from source.
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
        Check out some general concepts that will help you understand how gnark
        works under the hood and is architected.
      </>
    ),
    buttonName: "Go to concepts",
    buttonType: "secondary",
  },
  {
    title: "👨‍💻 Reference",
    link: "/Reference/api",
    description: (
      <>
        Find command line arguments, API methods through JSON-RPC, and general
        configuration in the References section.
      </>
    ),
    buttonName: "Go to reference",
    buttonType: "info",
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
