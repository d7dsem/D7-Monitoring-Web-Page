package main

import (
	"context"
	"fmt"
	"time"
)

func runMany(root int, num int, ctx context.Context) {

	for i := 0; i < num; i++ {

		go func(t, r int) {
			time.Sleep(1 * time.Second)
			id := fmt.Sprintf("go-r_%3.3d", t+r*100)
			fmt.Println(id, " starts")
			defer fmt.Println(id, " DONE2")

			for {
				select {
				case <-ctx.Done():
					fmt.Println(id, " DONE")
					return
				default:
					fmt.Println(id, " aliwe")
					time.Sleep(1 * time.Second)
				}
			}
		}(i, root)
	}
	fmt.Println("runMany DONE")
}
