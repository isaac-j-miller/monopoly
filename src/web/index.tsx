import "@blueprintjs/core/lib/css/blueprint.css";
import "@blueprintjs/icons/lib/css/blueprint-icons.css";
import "@blueprintjs/select/lib/css/blueprint-select.css";
import "@blueprintjs/table/lib/css/table.css";
import "./assets/style.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { assertIsDefined } from "common/util";
import { Home } from "./pages/home";
import { Game } from "./pages/game";
import { Lobby } from "./pages/lobby";

const domNode = document.getElementById("root");
assertIsDefined(domNode);
const root = createRoot(domNode);

root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Home />}></Route>
      <Route path="/lobby/:id" element={<Lobby />}></Route>
      <Route path="/game/:id" element={<Game />}></Route>
    </Routes>
  </BrowserRouter>
);
