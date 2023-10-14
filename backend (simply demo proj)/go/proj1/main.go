package main

import (
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"runtime"
	"sync"
	"time"
)

var (
	loyalists = []string{
		"For the Emperor!",
		"We are the shield of the Imperium!",
		"Death to the enemies!",
		"No mercy for traitors!",
		"We do not die, we pass into legends!",
	}

	traitors = []string{
		"Magnus did nothing wrong!",
		"Death to the false Emperor!",
		"The galaxy belongs to us!",
		"Join the dark powers!",
		"Revenge shall be ours!",
	}
)

func randomPhrase(strlist []string) string {
	return strlist[rand.Intn(len(strlist))]
}

// Structs to watch: Params and Dialog

type Params struct {
	TimeStart time.Time
	Dt        time.Duration

	Id string

	Max       int64
	Num       int64
	ShowEvery int64
}

const (
	min_phrases            = 3
	max_additional_phrases = 12
)

type Dialog struct {
	Phrases []string
}

var (
	PARMS *Params
	DLG   *Dialog
)

func (dlg *Dialog) Fill() {
	ln := rand.Intn(max_additional_phrases) + min_phrases
	strLists := [][]string{loyalists, traitors}
	side := rand.Intn(2)
	phrases := make([]string, ln)
	for i := 0; i < ln; i++ {
		phrases[i] = randomPhrase(strLists[side])
		side += 1
		side %= 2
	}
	dlg.Phrases = phrases
}

// Wed server stuff

type customMux struct {
	handlers map[string]http.HandlerFunc
}

func newCustomMux() *customMux {
	return &customMux{
		handlers: make(map[string]http.HandlerFunc),
	}
}

func (cm *customMux) register(path string, handler http.HandlerFunc) {
	cm.handlers[path] = handler
}

func (cm *customMux) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	if handler, exists := cm.handlers[r.URL.Path]; exists {
		handler(w, r)
	} else {
		http.NotFound(w, r)
	}
}

func setupCORS(w *http.ResponseWriter, req *http.Request) {
	(*w).Header().Set("Access-Control-Allow-Origin", "*")
	(*w).Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, PUT, DELETE")
	(*w).Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")
}

func handleRoot(w http.ResponseWriter, r *http.Request) {
	// HTML з посиланнями на інші маршрути
	setupCORS(&w, r)
	html := `
		<h1>Monitoring Routes:</h1>
		<ul>
			<li><a href="/status">Status</a></li>
			<li><a href="/dlg">Dialog</a></li>
			<li><a href="/param">Params</a></li>
			<li><a href="/mem">Memory</a></li>
		</ul>
	`
	w.Write([]byte(html))
}

func handleStatusReq(w http.ResponseWriter, r *http.Request) {
	setupCORS(&w, r)
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("Server is running"))
}

func handleDlgReq(w http.ResponseWriter, r *http.Request) {
	setupCORS(&w, r)
	data, err := json.Marshal(DLG)
	if err != nil {
		http.Error(w, "Failed to encode data", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(data)
}

func handleParamsReq(w http.ResponseWriter, r *http.Request) {
	setupCORS(&w, r)
	data, err := json.Marshal(PARMS)
	if err != nil {
		http.Error(w, "Failed to encode data", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(data)
}

func handleMemoryUsageReq(w http.ResponseWriter, r *http.Request) {
	setupCORS(&w, r)
	var memStats runtime.MemStats
	runtime.ReadMemStats(&memStats)

	data, err := json.Marshal(memStats)
	if err != nil {
		http.Error(w, "Failed to encode memory stats", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.Write(data)
}

func startWebServer(addr string, p *Params, dlg *Dialog) (string, error) {

	mux := newCustomMux()

	mux.register("/", handleRoot)
	mux.register("/status", handleStatusReq)
	mux.register("/dlg", handleDlgReq)
	mux.register("/param", handleParamsReq)
	mux.register("/mem", handleMemoryUsageReq)

	var err error = nil
	go func() {
		err = http.ListenAndServe(addr, mux)
	}()
	time.Sleep(50 * time.Millisecond)
	return addr, err
}

// -----------------------------------------------------
func main() {

	params := Params{
		TimeStart: time.Now(),
		Id:        "Dialog generator",
		Dt:        250 * time.Millisecond,
		Max:       -1,
		Num:       0,
		ShowEvery: 10,
	}
	_ = params
	dlg := Dialog{}

	PARMS = &params
	DLG = &dlg

	addr, err := startWebServer("127.0.0.1:49997", &params, &dlg)
	if err == nil {
		fmt.Println("Debug web server started at ", addr)
	} else {
		fmt.Println("Debug web server NOT started!")
	}

	var wg sync.WaitGroup
	wg.Add(1)
	// Simple generator
	go func() {
		defer wg.Done()
		for {
			dlg.Fill()
			params.Num++
			fmt.Printf("%3d  \tdialog len = %d\n", params.Num, len(dlg.Phrases))
			if params.Num%params.ShowEvery == 0 {
				for _, s := range dlg.Phrases {
					fmt.Printf("  %s\n", s)
				}
			}
			if params.Max > 0 && params.Num == params.Max {
				break
			}
			time.Sleep(params.Dt)
		}
	}()
	wg.Wait()
	fmt.Printf("Thats all folks!")
}
