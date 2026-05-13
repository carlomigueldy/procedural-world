package main

import (
	"log"
	"net/http"

	"procedural-world/server/internal/handler"
)

func main() {
	mux := http.NewServeMux()

	mux.HandleFunc("GET /health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusOK)
		w.Write([]byte(`{"status":"ok"}`))
	})

	mux.HandleFunc("GET /ws", handler.HandleWebSocket)

	addr := ":8080"
	log.Printf("server starting on %s", addr)
	log.Fatal(http.ListenAndServe(addr, mux))
}
