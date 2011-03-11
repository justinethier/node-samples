#include <v8.h>
#include <node.h>
#include <node_events.h>
#include <stdio.h>
#include <stdlib.h>
#include <assert.h>
#include <kdtree.h>

using namespace v8;
using namespace node;
static Persistent<String> test_symbol;

class KDTree : public EventEmitter {
  public:
    static void
    Initialize (v8::Handle<v8::Object> target){
        HandleScope scope;

        Local<FunctionTemplate> t = FunctionTemplate::New(New);

        t->Inherit(EventEmitter::constructor_template);
        t->InstanceTemplate()->SetInternalFieldCount(1);

        test_symbol = NODE_PSYMBOL("test");
        NODE_SET_PROTOTYPE_METHOD(t, "test", Test);

        target->Set(String::NewSymbol("KDTree"), t->GetFunction());
    }

    int Test()
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
       set = kd_nearest_range3(kd, 0, 0, 0, 100);
    //   msec = get_msec() - start;
    //
       i = kd_res_size(set);
       printf("range query returned %d items\n", kd_res_size(set));
       kd_res_free(set);
    
       kd_free(kd);
       return i;
    }

  protected:

    static Handle<Value>
    New (const Arguments& args){
        HandleScope scope;
        
        KDTree *kd = new KDTree();
        kd->Wrap(args.This());

        return args.This();
    }

    KDTree () : EventEmitter (){
        kd_ = NULL;

    }

    ~KDTree(){
        // TODO: may be more appropriate to free up the memory here...
        assert(kd_ == NULL);
    }

    static Handle<Value>
    Test (const Arguments& args){
        KDTree *kd = ObjectWrap::Unwrap<KDTree>(args.This());

        HandleScope scope;

        int num = kd->Test();

        return Integer::New(num); // Undefined();
    }

  private:
    kdtree* kd_;
};

extern "C" void
init (Handle<Object> target)
{
    HandleScope scope;
    KDTree::Initialize(target);
}

