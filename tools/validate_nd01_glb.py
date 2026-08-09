import bpy
import json
import os
from mathutils import Vector

GLB = r"C:\Users\Saisr\Desktop\Coding\NullDrive-Website\public\models\null-drive-nd01-web.glb"
REPORT = r"C:\Users\Saisr\Desktop\Coding\NullDrive-Website\public\models\null-drive-nd01-web-validation.json"
RENDER = r"C:\Users\Saisr\Desktop\Coding\NullDrive-Website\renders\nd01_v5_roundtrip.png"

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=GLB)
scene = bpy.context.scene
imported = list(scene.objects)

required = [
    "NullDrive_Root", "Shell_Top", "Upper_Shield", "PCB_Main",
    "Internal_Frame", "Lower_Shield", "Shell_Bottom", "Connector_Housing",
    "USB_C_Connector", "USB_C_Tongue", "Status_LED", "Seam_Accent",
    "Brand_NULLDRIVE", "Brand_ND01", "Controller_IC", "NAND_01",
    "NAND_02", "Power_Management",
]
presence = {name: bpy.data.objects.get(name) is not None for name in required}
hierarchy = {
    name: (bpy.data.objects[name].parent.name if bpy.data.objects[name].parent else None)
    for name in required if bpy.data.objects.get(name)
}

meshes = [obj for obj in imported if obj.type == "MESH"]
vertices = sum(len(obj.data.vertices) for obj in meshes)
polygons = sum(len(obj.data.polygons) for obj in meshes)
triangles = 0
zero_normals = 0
for obj in meshes:
    obj.data.calc_loop_triangles()
    triangles += len(obj.data.loop_triangles)
    zero_normals += sum(poly.normal.length < 0.5 for poly in obj.data.polygons)

mins = Vector((1e9, 1e9, 1e9))
maxs = Vector((-1e9, -1e9, -1e9))
for obj in meshes:
    for corner in obj.bound_box:
        point = obj.matrix_world @ Vector(corner)
        for axis in range(3):
            mins[axis] = min(mins[axis], point[axis])
            maxs[axis] = max(maxs[axis], point[axis])
dims = maxs - mins
center = (mins + maxs) / 2

images = [img for img in bpy.data.images if img.name not in {"Render Result", "Viewer Node"}]
image_info = [
    {"name": img.name, "resolution": [int(img.size[0]), int(img.size[1])], "packed": img.packed_file is not None}
    for img in images
]
materials = sorted(mat.name for mat in bpy.data.materials)

cyan = bpy.data.materials.get("ND01_Cyan_Emissive")
emission_ok = False
if cyan and cyan.use_nodes:
    shader = cyan.node_tree.nodes.get("Principled BSDF")
    emission_ok = bool(
        shader and shader.inputs.get("Emission Strength")
        and shader.inputs["Emission Strength"].default_value > 0
    )
branding_ok = all(
    bpy.data.objects.get(name)
    and bpy.data.objects[name].type == "MESH"
    and len(bpy.data.objects[name].data.vertices) > 0
    for name in ("Brand_NULLDRIVE", "Brand_ND01")
)

offsets = {
    "Shell_Top": 0.010,
    "Upper_Shield": 0.006,
    "PCB_Main": 0.003,
    "Internal_Frame": -0.003,
    "Lower_Shield": -0.006,
    "Shell_Bottom": -0.010,
}
original_locations = {name: bpy.data.objects[name].location.copy() for name in offsets}
before_world = {name: bpy.data.objects[name].matrix_world.translation.copy() for name in offsets}
for name, dz in offsets.items():
    bpy.data.objects[name].location.z += dz
bpy.context.view_layer.update()
move_test = {
    name: {
        "requested_z": dz,
        "world_delta": [round(float(value), 8) for value in (bpy.data.objects[name].matrix_world.translation - before_world[name])],
    }
    for name, dz in offsets.items()
}
for name, location in original_locations.items():
    bpy.data.objects[name].location = location
bpy.context.view_layer.update()
moves_restored = all(
    (bpy.data.objects[name].location - original_locations[name]).length < 1e-9
    for name in offsets
)

report = {
    "glb": GLB,
    "required_objects": presence,
    "all_required_present": all(presence.values()),
    "hierarchy": hierarchy,
    "imported_object_count": len(imported),
    "mesh_object_count": len(meshes),
    "vertices": vertices,
    "polygons": polygons,
    "triangles": triangles,
    "dimensions_mm": [round(value * 1000, 4) for value in dims],
    "center_mm": [round(value * 1000, 4) for value in center],
    "materials": materials,
    "material_count": len(materials),
    "images": image_info,
    "imported_camera_count": sum(obj.type == "CAMERA" for obj in imported),
    "imported_light_count": sum(obj.type == "LIGHT" for obj in imported),
    "animation_action_count": len(bpy.data.actions),
    "branding_meshes_ok": branding_ok,
    "cyan_emission_ok": emission_ok,
    "zero_length_polygon_normals": zero_normals,
    "move_test": move_test,
    "moves_restored": moves_restored,
}

def aim(obj, target=(0, 0, 0)):
    obj.rotation_euler = (Vector(target) - obj.location).to_track_quat("-Z", "Y").to_euler()

camera_data = bpy.data.cameras.new("_ValidationCamera")
camera = bpy.data.objects.new("_ValidationCamera", camera_data)
scene.collection.objects.link(camera)
camera.location = (0.115, -0.155, 0.090)
camera.data.lens = 74
aim(camera, (0, 0, 0.001))
scene.camera = camera

def add_light(name, location, target, power, width, height, color):
    data = bpy.data.lights.new(name, "AREA")
    obj = bpy.data.objects.new(name, data)
    scene.collection.objects.link(obj)
    obj.location = location
    data.shape = "RECTANGLE"
    data.size = width
    data.size_y = height
    data.energy = power
    data.color = color
    aim(obj, target)

add_light("_ValidationKey", (0.025, -0.11, 0.030), (0, 0, 0), 0.38, 0.036, 0.004, (1.0, 0.84, 0.72))
add_light("_ValidationRim", (-0.04, 0.09, 0.030), (0, 0, 0), 0.44, 0.046, 0.003, (0.65, 0.78, 1.0))
add_light("_ValidationFill", (-0.06, -0.04, 0.04), (0, 0, 0), 0.06, 0.05, 0.015, (0.7, 0.8, 1.0))

bpy.ops.mesh.primitive_plane_add(size=0.5, location=(0, 0, -0.00465))
floor = bpy.context.view_layer.objects.active
floor.name = "_ValidationFloor"
floor_material = bpy.data.materials.new("_ValidationFloorMaterial")
floor_material.use_nodes = True
floor_shader = floor_material.node_tree.nodes.get("Principled BSDF")
floor_shader.inputs["Base Color"].default_value = (0.002, 0.003, 0.004, 1)
floor_shader.inputs["Roughness"].default_value = 0.48
floor.data.materials.append(floor_material)

if scene.world is None:
    scene.world = bpy.data.worlds.new("ND01_Validation_World")
scene.world.use_nodes = True
background = scene.world.node_tree.nodes.get("Background")
background.inputs["Color"].default_value = (0.0005, 0.0008, 0.0015, 1)
background.inputs["Strength"].default_value = 0.003
try:
    scene.render.engine = "BLENDER_EEVEE_NEXT"
except Exception:
    pass
scene.render.resolution_x = 960
scene.render.resolution_y = 540
scene.render.resolution_percentage = 100
scene.render.image_settings.file_format = "PNG"
scene.render.filepath = RENDER
bpy.ops.render.render(write_still=True)
report["validation_render"] = RENDER
report["validation_render_exists"] = os.path.exists(RENDER)

with open(REPORT, "w", encoding="utf-8") as handle:
    json.dump(report, handle, indent=2)

print("ND01_VALIDATION=" + json.dumps(report, separators=(",", ":")))
