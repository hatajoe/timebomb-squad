#!/bin/bash
	CPU1=(`head -1 /proc/stat`)

	while [ true ]
do
	   sleep 1
	   CPU2=(${CPU1[@]})
	   CPU1=(`head -1 /proc/stat`)
	 
	   total=`expr ${CPU1[1]} - ${CPU2[1]} + ${CPU1[2]} - ${CPU2[2]} + ${CPU1[3]} - ${CPU2[3]} + ${CPU1[4]} - ${CPU2[4]}`
	 
	   user=`echo "scale=2; (${CPU1[1]} - ${CPU2[1]}) * 100 / $total" | bc;`
	   nice=`echo "scale=2; (${CPU1[2]} - ${CPU2[2]}) * 100 / $total" | bc;`
	   sys=`echo "scale=2; (${CPU1[3]} - ${CPU2[3]}) * 100 / $total" | bc;`
	   idle=`echo "scale=2; (${CPU1[4]} - ${CPU2[4]}) * 100 / $total" | bc;`
	 
	   printf "`date '+%Y/%m/%d %H:%M:%S'` `hostname` %3.2f %3.2f %3.2f %3.2f %d\n" $user $nice $sys $idle $total
	done
