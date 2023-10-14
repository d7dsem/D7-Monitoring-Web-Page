package main

import (
	"context"
	"fmt"
	"time"
)

func main() {

	num := 5
	to := 10000 * time.Millisecond
	ctx := context.Background()
	ctxTO, cancel := context.WithTimeout(ctx, to)
	for i := 1; i < 6; i++ {
		fmt.Printf("Starting %d pack of %d goroutines\n", i, num)
		runMany(i, num, ctxTO)
	}
	fmt.Println("-------------------")
	time.Sleep(15 * time.Second)
	fmt.Println("Call context.cancel")
	cancel()
	fmt.Println("waiting...")
	//TODO: checking plugin TODO Highlighter
	time.Sleep(45 * time.Second)
}
