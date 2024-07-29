"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Form from "react-bootstrap/Form";
import Modal from "react-bootstrap/Modal";
import ListGroup from "react-bootstrap/ListGroup";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";

import ListComp from "@/components/ListComp";
import type { IPosts } from "./page";

import EditIcon from "./../../public/edit.svg";

import styles from "./NotesBase.module.scss";

export default function NotesBase({ data }: { data: IPosts[] }) {
  const [selectedNote, setSelectedNote] = useState<IPosts | null>(null);
  const [formValues, setFormValues] = useState<IPosts | null>(null);
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [notes, setNotes] = useState<IPosts[]>(data);
  const [showModal, setShowModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1200);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Update local state when a new note is selected
  useEffect(() => {
    if (selectedNote) {
      setFormValues(selectedNote);
    }
  }, [selectedNote]);

  const truncateDesc = (desc: string, maxLength: number) => {
    if (desc.length > maxLength) {
      return desc.slice(0, maxLength) + "...";
    }
    return desc;
  };

  const handleNoteClick = (note: IPosts) => {
    if (
      formValues &&
      (formValues.title !== note.title || formValues.desc !== note.desc)
    ) {
      saveChanges(); // Save changes before switching notes
    }
    setSelectedNote(note);
    if (isMobile) {
      setShowModal(true);
    }
  };

  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      setSelectedNote(null);
    }
  };

  useEffect(() => {
    window.addEventListener("keydown", handleEscape);
    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (formValues) {
      setFormValues({
        ...formValues,
        [e.target.name]: e.target.value,
      });
    }
  };

  const saveChanges = async () => {
    if (formValues) {
      try {
        const response = await fetch(
          `http://localhost:3001/posts/${formValues.id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(formValues),
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const updatedNote = await response.json();
        console.log("Updated note:", updatedNote); // Debugging
        setNotes((prevNotes) =>
          prevNotes.map((note) =>
            note.id === updatedNote.id ? updatedNote : note
          )
        );
      } catch (error) {
        console.error("Failed to save changes:", error);
      }
    }
  };

  const handleBlur = () => {
    saveChanges();
  };

  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (e.key === "Enter") {
      saveChanges();
    }
  };

  const parseDate = (dateStr: string) => {
    const [day, month, year] = dateStr.split(".");
    return new Date(`${year}-${month}-${day}`);
  };

  const sortedData = [...notes].sort((a, b) => {
    const dateA = parseDate(a.date);
    const dateB = parseDate(b.date);
    if (sortOrder === "asc") {
      return dateA.getTime() - dateB.getTime();
    } else {
      return dateB.getTime() - dateA.getTime();
    }
  });

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  };

  const handleAddNote = async () => {
    const newNote: IPosts = {
      id: String(notes.length + 1),
      title: "New Note",
      desc: "",
      date: formatDate(new Date()),
    };

    try {
      const response = await fetch(`http://localhost:3001/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newNote),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const createdNote = await response.json();
      setNotes([...notes, createdNote]);
      setSelectedNote(createdNote);
    } catch (error) {
      console.error("Failed to add new note:", error);
    }
  };

  const handleDelete = async (id: string) => {
    console.log("deleting");
    try {
      const response = await fetch(`http://localhost:3001/posts/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      setNotes(notes.filter((note) => note.id !== id));
      if (selectedNote?.id === id) {
        setSelectedNote(null);
      }
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  const NoteDetailContent = () => (
    <div className={styles.noteDetail}>
      <Form>
        <Form.Group className={styles.titleContainer}>
          <Form.Control
            type="text"
            size="lg"
            placeholder="title"
            name="title"
            value={formValues?.title || ""}
            className={styles.title}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyPress={handleKeyPress}
          />
        </Form.Group>
        <Form.Group className={styles.descContainer}>
          <Form.Control
            type="text"
            as="textarea"
            placeholder="description"
            name="desc"
            value={formValues?.desc || ""}
            className={styles.desc}
            onChange={handleChange}
            onBlur={handleBlur}
            onKeyPress={handleKeyPress}
          />
        </Form.Group>
      </Form>
    </div>
  );

  return (
    <div className="root">
      <div className="content">
        <div className={styles.container}>
          <div className={styles.sidebarContainer}>
            <div className={styles.upperContainer}>
              <Image
                className={styles.newNoteIcon}
                src={EditIcon}
                alt="newNote"
                onClick={handleAddNote}
              />
              <div className={styles.sortContainer}>
                <DropdownButton id="dropdown-item-button" title="Сортировка">
                  <Dropdown.ItemText>По Дате</Dropdown.ItemText>
                  <Dropdown.Item
                    as="button"
                    onClick={() => setSortOrder("desc")}
                  >
                    Сначала новые
                  </Dropdown.Item>
                  <Dropdown.Item
                    as="button"
                    onClick={() => setSortOrder("asc")}
                  >
                    Сначала старые
                  </Dropdown.Item>
                </DropdownButton>
              </div>
            </div>
            <div className={styles.listGroup}>
              <ListGroup as="ol">
                {sortedData.map((item, index) => (
                  <ListComp
                    key={item.id}
                    title={item.title}
                    desc={truncateDesc(item.desc, 20)}
                    date={item.date}
                    onClick={() => handleNoteClick(item)}
                    handleDelete={() => handleDelete(item.id)}
                  />
                ))}
              </ListGroup>
            </div>
          </div>

          {isMobile ? (
            <Modal
              show={showModal}
              fullscreen
              onHide={() => setShowModal(false)}
              className={styles.modal}
            >
              <Modal.Header closeButton />
              <Modal.Body className={styles.mobileNoteDetailContainer}>
                {selectedNote && <NoteDetailContent />}
              </Modal.Body>
            </Modal>
          ) : (
            <div className={styles.noteDetailContainer}>
              {selectedNote && <NoteDetailContent />}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
