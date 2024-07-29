import Image from "next/image";
import Badge from "react-bootstrap/Badge";
import ListGroup from "react-bootstrap/ListGroup";

import CrossIcon from "./../../public/cross.svg";
import styles from "./ListComp.module.scss";

export default function ListComp({
  title,
  desc,
  date,
  onClick,
  handleDelete,
}: {
  title: string;
  desc: string;
  date: string;
  onClick: () => void;
  handleDelete: () => void;
}) {
  return (
    <ListGroup.Item
      as="li"
      className={styles.listGroupItem}
      onClick={onClick}
      key={title}
    >
      <Image
        className={styles.crossIcon}
        src={CrossIcon}
        alt="del"
        // onClick={handleDelete}
        onClick={(e) => {
          e.stopPropagation();
          handleDelete();
        }}
      />
      <div className="ms-2 me-auto">
        <div className="fw-bold">{title}</div>
        {desc}
      </div>
      <Badge bg="primary" pill>
        {date}
      </Badge>
    </ListGroup.Item>
  );
}
