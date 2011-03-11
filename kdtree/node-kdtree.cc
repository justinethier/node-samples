#include <v8.h>
#include <stdio.h>
#include <stdlib.h>
#include <assert.h>
#include <kdtree.h>

using namespace v8;

int test();

extern "C" void
init (Handle<Object> target)
{
    HandleScope scope;
      target->Set(String::New("result"), Integer::New(test()));
}

int test()
{
   int i, vcount = 10;
   kdtree *kd;
   kdres *set;
//   unsigned int msec, start;

   printf("inserting %d random vectors... ", vcount);
   fflush(stdout);

   kd = kd_create(3);

//   start = get_msec();
   for(i=0; i<vcount; i++) {
           float x, y, z;
           x = ((float)rand() / RAND_MAX) * 200.0 - 100.0;
           y = ((float)rand() / RAND_MAX) * 200.0 - 100.0;
           z = ((float)rand() / RAND_MAX) * 200.0 - 100.0;

           assert(kd_insert3(kd, x, y, z, 0) == 0);
   }
//   msec = get_msec() - start;
//   printf("%.3f sec\n", (float)msec / 1000.0);

//   start = get_msec();
   set = kd_nearest_range3(kd, 0, 0, 0, 40);
//   msec = get_msec() - start;
//
   i = kd_res_size(set);
   printf("range query returned %d items\n", kd_res_size(set));
   kd_res_free(set);

   kd_free(kd);
   return i;
}
