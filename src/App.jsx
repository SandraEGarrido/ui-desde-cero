import React, { useEffect, useState } from "react";
import TableCell from "@mui/material/TableCell";
import Drawer from "@mui/material/Drawer"; // panel lateral
import Box from "@mui/material/Box"; // contenedor con sx
import Typography from "@mui/material/Typography"; // títulos/textos
import IconButton from "@mui/material/IconButton"; // botón para cerrar
import CloseIcon from "@mui/icons-material/Close"; // ícono de cerrar

import {
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";

export default function AppConFetch() {
  const [personajes, setPersonajes] = useState([]);
  const [seleccionado, setSeleccionado] = useState(null);
  // guardará el personaje clickeado; null = sin panel abierto

  // 🔹 1) ESTADO PARA "FIRST SEEN IN"
  const [firstSeen, setFirstSeen] = useState("—");

  const [cargandoEp, setCargandoEp] = useState(false);

  const verDetalle = (p) => setSeleccionado(p);

  // 🔹 al cerrar, limpio también firstSeen
  const cerrarDetalle = () => {
    setSeleccionado(null); // cierro el panel
    setFirstSeen("—"); // limpio el texto de "Primera aparición"
    setCargandoEp(false); // por si quedó cargando, lo apago
  };

  const columnas = ["Nombre", "Especie", "Estado", "Foto"];

  // 1) Traer la lista inicial de personajes (una sola vez)
  useEffect(() => {
    fetch("https://rickandmortyapi.com/api/character")
      .then((res) => res.json())
      .then((data) => setPersonajes(data.results || [])) // guardo el ARRAY
      .catch((error) => console.error("El Error es:", error));
  }, []); // corre una sola vez al montar

  // 2) Cuando cambia "seleccionado", traer el NOMBRE del primer episodio
  useEffect(() => {
    let cancel = false;

    (async () => {
      if (!seleccionado) {
        // si cerraste el panel o aún no hay personaje
        setFirstSeen("—"); // reseteo el texto
        setCargandoEp(false); // me aseguro de que no quede "Cargando..."
        return;
      }

      try {
        setCargandoEp(true); // empieza la carga
        const url = seleccionado.episode?.[0]; // primera aparición (URL)
        if (!url) {
          setFirstSeen("—");
          return;
        } // si no hay, dejo "—"
        const ep = await fetch(url).then((r) => r.json()); // pido ese episodio
        if (!cancel) setFirstSeen(ep?.name ?? "—"); // guardo el nombre del ep.
      } catch {
        if (!cancel) setFirstSeen("—"); // ante error, muestro "—"
      } finally {
        if (!cancel) setCargandoEp(false); // termina la carga
      }
    })();

    // cleanup: si cambia rápido el seleccionado o se desmonta, no setear estado
    return () => {
      cancel = true;
    };
  }, [seleccionado]);

  return (
    <>
      <TableContainer component={Paper} sx={{ width: "100%", overflowX: "auto", mt: 1 }}>

        <Drawer
          anchor="right"
          open={Boolean(seleccionado)}
          onClose={cerrarDetalle} // cerrar con X o ESC
          hideBackdrop // ← deja la tabla clickeable
          ModalProps={{ keepMounted: true, BackdropProps: { invisible: true } }}
          PaperProps={{
            sx: {
              width: { xs: "100%", sm: 480, md: 560 },
              p: 0,
              backgroundColor: "transparent",
              borderRadius: "16px 0 0 16px",
              boxShadow: "0 18px 60px rgba(0,0,0,.6)",
              overflow: "auto",
            },
          }}
        >
          {seleccionado && (
            <Box
              // quitá la clase o dejala, pero forzá estos estilos
              sx={{
                width: "100%", // el sheet NO debe ser más ancho que el Drawer
                maxWidth: "100%",
                p: 2, // padding interno (lo que antes daba la clase)
                bgcolor: "#0f172a", // fondo oscuro (si lo querés aquí)
                color: "#e5e7eb",
                borderRadius: 2,
              }}
            >
              {/* Encabezado */}
              <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                <Typography variant="h6" sx={{ flex: 1, fontWeight: 800 }}>
                  {seleccionado.name}
                </Typography>

                {/* Badge con ID (informativo, discreto) */}
                <Box
                  sx={{
                    bgcolor: "#1e293b",
                    color: "#94a3b8",
                    border: "1px solid rgba(148,163,184,.25)",
                    px: 1.2,
                    py: 0.6,
                    borderRadius: 1.2,
                    fontSize: 12,
                    fontWeight: 700,
                    mr: 1,
                  }}
                >
                  ID #{seleccionado.id}
                </Box>

                <IconButton
                  aria-label="cerrar"
                  onClick={cerrarDetalle}
                  sx={{ color: "#e5e7eb" }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>

              {/* Imagen grande (centrada, sin recorte) */}
              <Box sx={{ mb: 2, px: 2 /* acolchado lateral del hero */ }}>
                <Box
                  component="img"
                  src={seleccionado.image}
                  alt={seleccionado.name}
                  sx={{
                    display: "block",
                    width: "min(560px, 100%)", // límite cómodo dentro del panel
                    height: "auto",
                    maxHeight: 360,
                    objectFit: "contain", // NO recorta
                    backgroundColor: "rgba(255,255,255,.06)",
                    borderRadius: 2,
                    p: 1,
                    boxShadow: "0 10px 30px rgba(0,0,0,.35)",
                    mx: "auto", // 👈 centra horizontalmente
                  }}
                />
              </Box>
              {/* Bloque 1: ESPECIE + ESTADO */}
              <Box sx={{ bgcolor: "#1e293b", p: 2, borderRadius: 2, mb: 2 }}>
                <Typography
                  variant="caption"
                  sx={{ color: "#cbd5e1", letterSpacing: ".06em" }}
                >
                  ESPECIE
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {seleccionado.species || "—"}
                </Typography>

                <Box
                  sx={{ borderTop: "1px solid rgba(148,163,184,.2)", my: 1 }}
                />

                <Typography
                  variant="caption"
                  sx={{ color: "#cbd5e1", letterSpacing: ".06em" }}
                >
                  ESTADO
                </Typography>
                <Box
                  sx={{
                    mt: 0.5,
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 1,
                    px: 1.2,
                    py: 0.6,
                    borderRadius: 999,
                    fontWeight: 700,
                    bgcolor: "rgba(148,163,184,.14)",
                  }}
                >
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: "50%",
                      bgcolor:
                        (seleccionado.status || "").toLowerCase() === "alive"
                          ? "#22c55e"
                          : (seleccionado.status || "").toLowerCase() === "dead"
                          ? "#ef4444"
                          : "#a78bfa",
                    }}
                  />
                  <Typography variant="body2">
                    {seleccionado.status || "—"}
                  </Typography>
                </Box>
              </Box>

              {/* Bloque 2: UBICACIÓN + PRIMERA APARICIÓN */}
              <Box sx={{ bgcolor: "#1e293b", p: 2, borderRadius: 2 }}>
                <Typography
                  variant="caption"
                  sx={{ color: "#cbd5e1", letterSpacing: ".06em" }}
                >
                  ÚLTIMA UBICACIÓN CONOCIDA
                </Typography>
                <Typography variant="body1" sx={{ mb: 1 }}>
                  {seleccionado.location?.name ?? "—"}
                </Typography>

                <Box
                  sx={{ borderTop: "1px solid rgba(148,163,184,.2)", my: 1 }}
                />

                <Typography
                  variant="caption"
                  sx={{ color: "#cbd5e1", letterSpacing: ".06em" }}
                >
                  PRIMERA APARICIÓN
                </Typography>
                <Typography variant="body1">
                  {cargandoEp ? "Cargando…" : firstSeen}
                </Typography>
              </Box>
            </Box> // ← cierra <Box className="modal-sheet">
          )}
        </Drawer>

        {/* TABLA */}
        <Table sx={{ maxWidth: 700 }} aria-label="tabla-personajes">
          <TableHead>
            <TableRow>
              {columnas.map((columna) => (
                <TableCell key={columna}>
                  <strong>{columna}</strong>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {personajes.map((personaje) => (
              <TableRow
                key={personaje.id}
                hover
                selected={seleccionado?.id === personaje.id}
              >
                <TableCell>{personaje.name}</TableCell>
                <TableCell>{personaje.species}</TableCell>
                <TableCell>{personaje.status}</TableCell>
                <TableCell>
                  <img
                    src={personaje.image}
                    width="100"
                    height="100"
                    alt={personaje.name}
                    style={{ cursor: "pointer", borderRadius: 6 }}
                    onClick={() => verDetalle(personaje)}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
}
